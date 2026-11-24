Status: Approved

# LINE Login 授權碼交換移至後端，並修正 Webhook 簽章驗證與 login CSRF（line-login-token-exchange）

> 文件慣例：說明文字以 `U+XXXX` 表示 code point，程式碼中以 `\u{XXXX}` 或 `\p{...}` 表示。

## 0. 修訂紀錄

- **第 2 版**：依使用者決策併入 webhook 簽章修正與 state / nonce；route 與 401 已核定；正式網域列為前置條件；secret 輪替由使用者手動執行；已確認兩個 channel 屬於同一個 Provider。
- **第 3 版**：納入經驗證的 Gemini Neon / Carbon 審查結果（採納第 1-16 項，對應如下）：
  - 測試環境隔離（6.1）。
  - 部署前檢查 `LINE_MESSAGE_CHANNEL_SECRET`（8.1）。
  - middleware 判斷順序與 Plan B（4.3、4.5）。
  - route 變體測試（6.3）。
  - 錯誤對應（3.3）。
  - 逾時（3.2）。
  - `URLSearchParams` 與 DTO 格式（3.1、3.2）。
  - env 解析（3.2）。
  - `displayName` 清洗（3.2）。
  - popup 競態與 `sessionStorage` 錯誤（5.1）。
  - callback 清除網址與取消導向（5.1）。
  - 先刪 `VITE_LINE_CHANNEL_SECRET` 再部署前端（8.2）。
  - webhook 修正單獨部署（8.2）。
  - 全 `src/` 靜態檢查（6.5）。
  - Jest 單元測試（6.4）。
  - 其他注意事項（6.1、8.1、第 12 節）。
  - 未採納的項目移到第 11 節。Carbon C-1 列為待使用者決定（第 12 節）。
  - 在 `app.module.ts` 註冊 `AuthController` / `LineLoginService` 屬於計畫範圍，已獲同意。

## 1. 背景與問題（已驗證）

1. **Channel secret 外洩**：`src/services/api-line.ts` `exchangeLineCodeForToken` 在瀏覽器帶 `client_secret: import.meta.env.VITE_LINE_CHANNEL_SECRET` 呼叫 LINE `/token`（呼叫點在 `src/services/line-auth-flow.ts:63`）。Vite 會把這個值內嵌進 bundle。
2. **前端實際用到的資料**：只用 `access_token` 呼叫 `/userinfo`，取 `sub`（作為 socialId）與 `name`（寫入學員 note）。沒有驗證 `id_token`。scope 為 `profile openid`。
3. **Webhook 簽章沒有驗證**：
   - route 是 `POST /webhook`，但 `app.module.ts` `configure()` 只把 SDK middleware 套在 `/line/*path`。
   - 沒有 global prefix，`vercel.json` 把 `/(.*)` 直接導向 `src/main.ts`。
4. **Login CSRF**：`state` 由 `Math.random` 產生，callback 時沒有比對（`validateState` 從未被呼叫），授權 URL 也沒有 `nonce`。
5. **`LINE_BOT/.env` 被 git 追蹤，也會隨程式碼一起部署**：Vercel 上沒有設定的 env 會 fallback 到這個檔案裡的正式值（正式 DB、正式 `LINE_MESSAGE_CHANNEL_SECRET`）。本機的 `ConfigModule` 使用 `envFilePath: [".env.local", ".env"]`，所以 `.env.local` 優先。

## 2. 範圍

### 範圍內

- 後端 `/Users/wayne/Github/LINE_BOT`：
  - 對 `POST /webhook` 強制驗證簽章；
  - 新增 `POST /auth/line-login`；
  - 為上述兩者撰寫最小的 Jest 單元測試。
- 前端 `/Users/wayne/Github/Managment_Web`：
  - 改呼叫後端，移除 `VITE_LINE_CHANNEL_SECRET`；
  - 改用密碼學亂數產生 `state` / `nonce`，並在 callback 時驗證。
- 部署順序、回滾方式，以及給使用者的 secret 輪替步驟。

### 範圍外

- 第 11 節列出的所有風險。
- 讓 Vercel Preview 環境可以 LINE 登入。
- 新增任何相依套件。

## 3. LINE Login 交換（`POST /auth/line-login`，已核定）

### 3.1 合約與 DTO

```
POST /auth/line-login   { "code": string, "redirectUri": string, "nonce": string }
200 OK                  { "userId": string, "displayName": string }
```

`LineLoginDto`：

- 每個欄位都先用 `@Transform` trim（字串才處理），再加 `@IsString() @IsNotEmpty()`，所以只有空白的輸入會被拒絕。
- `code`：`@MaxLength(512) @Matches(/^[A-Za-z0-9._~-]+$/)`（只允許 URL-safe 字元）。
- `redirectUri`：`@MaxLength(2048)`。之後再由 allowlist 做完全比對。
- `nonce`：`@Matches(/^[A-Za-z0-9_-]{43}$/)`。前端以 32 bytes 亂數轉 **base64url、不含 padding** 產生，長度剛好 43 字元。

### 3.2 設計決策

- **只回 `{ userId, displayName }`**，不回傳任何 token。
- **流程**：`/token` → `/oauth2/v2.1/verify`，form 參數為 `id_token`、`client_id`、`nonce`。LINE 會檢查簽章、`aud`、`iss`、`exp` 與 `nonce`。
  - 不採用 `/userinfo`：沒有 `aud` 與 `nonce` 綁定。
  - 不採用自行 JWKS 驗證：需要新增相依套件。
- **HTTP**：使用 Node 內建 `fetch`。form body 一律用 `new URLSearchParams({...})` 產生，不做字串串接。
  - 每次上游呼叫 `AbortSignal.timeout(4000)`，兩次合計不超過 8 秒，以免超過 Vercel function 執行上限。
  - 使用者不確定 `maxDuration`（2026-11-24）。決定：不修改 `vercel.json`（它使用舊式 `builds` 設定，不能與 `functions.maxDuration` 併用）。兩次上游呼叫合計最多 8 秒，低於 Vercel 各方案 Node function 最小的預設上限（10 秒），因此不依賴設定值。部署後如在 Vercel Logs 看到 timeout，再另行處理。
- **Server-only env**（與 Messaging API 的 `LINE_MESSAGE_CHANNEL_SECRET` / `LINE_MESSAGE_CHANNEL_ACCESS_TOKEN` 分開，不得互相 fallback）：
  - `LINE_LOGIN_CHANNEL_ID`、`LINE_LOGIN_SECRET`：trim 後必須非空。
  - `LINE_LOGIN_REDIRECT_URIS`：`split(",").map(trim).filter(Boolean)`，至少要有 1 筆。每筆都必須是 `https://`；只有 `NODE_ENV !== "production"` 時才允許 `http://localhost` / `http://127.0.0.1`。
  - 任何一項不合格時回 500（`伺服器設定錯誤`），fail closed。每次請求時讀取，啟動時不 throw。
- **allowlist**：完全字串比對。不在名單內回 400，而且不呼叫 LINE。
- **`displayName` 清洗（伺服器端）**：
  - 移除 `\p{Cc}` 與 `\p{Cf}`（包含 BiDi 控制字元 `U+202A`-`U+202E`、`U+2066`-`U+2069` 與零寬字元），但保留 `U+200D`，以免拆散 emoji 序列；
  - 再 trim，並以 code point 計算截斷至 64；
  - 缺少時回空字串。
  - 前端只以文字插值顯示或寫入 note，不使用 `v-html`。
- **`sub`**：必須是非空字串，否則回 502。
- **Controller**：`AuthController`（`@Controller("auth")`、`@Post("line-login")`、`@HttpCode(200)`），在 `app.module.ts` 註冊 `AuthController` 與 `LineLoginService`。
- **已確認**：兩個 channel 屬於同一個 Provider，所以 `sub` 等於 webhook 的 `userId`。
- **Preview 環境無法 LINE 登入**：網址不固定，無法列入 allowlist。這是已接受的限制。

### 3.3 錯誤對應

所有 `fetch` 呼叫都包在 try/catch 中，只拋出乾淨的 Nest exception，不把原始 error 物件、response body 往外拋或寫進 log。

| 情境 | 狀態碼 | 回應 message | log |
|---|---|---|---|
| DTO 驗證失敗 | 400 | Nest 預設 | 無 |
| `redirectUri` 不在 allowlist | 400 | `redirect_uri 不允許` | 無 |
| `/token` 回 `error=invalid_grant` | **401** | `LINE 授權碼無效或已過期，請重新登入` | `token invalid_grant` |
| `/verify` 回 4xx（id_token 無效、過期、`nonce` 不符） | **401** | 同上 | `verify <status>` |
| `/token` 回 `invalid_client`、`unauthorized_client`、`invalid_request` 或其他 4xx（設定錯誤） | 500 | `伺服器設定錯誤` | 只記錄 error code |
| 429、5xx、逾時、網路錯誤、非 JSON 回應、缺少 `id_token` / `sub` | 502 | `LINE 服務暫時無法使用，請稍後再試` | 階段加狀態碼或 `timeout` |
| env 不合格 | 500 | `伺服器設定錯誤` | `config invalid` |

### 3.4 Logging 與定位

- **絕不** log：`code`、`nonce`、token、secret、上游 body、`x-line-signature`、webhook body、`error_description`。
- `main.ts` 的 `enableCors()` 沒有任何選項（允許所有 origin），本次不修改。
- 此 endpoint 不發 session，也**不是** API 驗證機制，程式註解與文件不得這樣宣稱。

### 環境變數命名（使用者於核准後決定，2026-11-24）

後端改用使用者在 `.env.local` 採用的名稱：

| 用途 | 名稱 | 舊名稱（相容） |
|---|---|---|
| LINE Login Channel ID | `LINE_LOGIN_CHANNEL_ID` | — |
| LINE Login Channel secret | `LINE_LOGIN_SECRET` | — |
| LINE Login redirect 白名單 | `LINE_LOGIN_REDIRECT_URIS` | — |
| Messaging API channel secret（webhook 簽章） | `LINE_MESSAGE_CHANNEL_SECRET` | `CHANNEL_SECRET` |
| Messaging API access token | `LINE_MESSAGE_CHANNEL_ACCESS_TOKEN` | `CHANNEL_ACCESS_TOKEN` |

- Messaging 兩個變數：**先讀新名稱，讀不到（或 trim 後為空）才退回舊名稱**。正式環境（Vercel 與被追蹤的 `.env`）目前仍是舊名稱，因此部署時不必先改 Vercel 也不會停擺；之後使用者可在 Vercel 改成新名稱，再移除舊名稱。
- 新舊名稱的讀取集中在一個 helper（例如 `readMessagingSecret(config)`、`readMessagingAccessToken(config)`），middleware、`app.module.ts` 的啟動檢查、`line.service.ts`、`src/tools/upload_menu.ts` 都使用它；`upload_menu.ts` 直接讀 `process.env`，照同樣順序。
- LINE Login 與 Messaging 之間**不得**互相 fallback。
- 啟動警告與 log 只列名稱，不列值。

## 4. Webhook 簽章驗證

### 4.1 已驗證的事實（已安裝原始碼）

- **`@line/bot-sdk` 11.0.0 `lib/middleware.ts`**：
  - 讀取順序是 `req.rawBody` → `req.body`（string 或 Buffer）→ 自行讀取 stream。
  - 失敗時呼叫 `next(SignatureValidationFailed)`，這不是 `HttpException`，Nest 會回 500。
  - secret 為空時，建構階段就會 throw。
- **`@nestjs/core` `nest-application.js`**：`registerParserMiddleware()` 先於 `registerModules()`。所以 JSON 已經先被解析，stream 已經讀完，直接套用 SDK middleware 只會讀到空 Buffer，**所有合法 event 都會被拒絕**。
- **`@nestjs/platform-express` `get-body-parser-options.util.js`**：`rawBody: true` 時，body-parser 的 `verify` callback 會設定 `req.rawBody`（Buffer）。

### 4.2 決策

採用 `rawBody: true` 加上自寫的 `LineSignatureMiddleware`，內部使用 SDK 的 `validateSignature`（內部用 `timingSafeEqual`）。不直接使用 SDK middleware，原因見 4.1。也不採用 guard，因為使用者要求綁定在 `configure()`，middleware 也比 guard 更早攔截。

- `main.ts`：改為 `NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true })`。
- `app.module.ts` `configure()`：把 `/line/*path` 的死綁定替換為 `.apply(LineSignatureMiddleware).forRoutes(LineController)`。
  - 以 controller 綁定，對 route 的大小寫與結尾斜線變體，與實際 handler 使用同一套比對；以 6.3 的變體測試確認。
  - 不再 import SDK 的 `middleware`。
  - `/auth/line-login` 與其他 route 都不套用。
- 修正後，`line.service.ts`「產生報表」的教練限制（約 989-993 行）才真正生效。前提是 Messaging API secret 沒有外流，見第 12 節 C-1。

### 4.3 `LineSignatureMiddleware` 判斷順序

1. `LINE_MESSAGE_CHANNEL_SECRET` 經 trim 後為空 → **500**，log `webhook-signature: secret missing`。
2. 缺少 `x-line-signature`，或它不是字串 → **401**。
3. `Content-Type` 不是 `application/json`（允許 charset 參數，使用 `req.is("application/json")`）→ **401**。
4. `req.rawBody` 不是 Buffer：
   - `content-length` 缺少或為 `0`（空 body，body-parser 不會呼叫 `verify`）→ **401**；
   - 其他情況（JSON 請求有 body，卻沒有 rawBody）→ **500**，log `webhook-signature: rawBody unavailable`。這代表設定失效，必須 fail closed。
5. `rawBody.length === 0` → **401**。
6. `validateSignature(rawBody, secret, signature)` 為 false → **401**。
7. 通過後才 `next()`。

- 拒絕一律 throw `UnauthorizedException` / `InternalServerErrorException`，所以 handler 不會執行。
- log 只寫判斷結果代碼，不寫 header 或 body。
- 格式錯誤的 JSON 會先被 body-parser 以 4xx 拒絕，handler 同樣不會執行。

### 4.4 Vercel `@vercel/node` 相容性

- **靜態判斷**：入口 `src/main.ts` 呼叫 `app.listen()`，請求以 Node `IncomingMessage` 交給 Express，由 Nest 的 body-parser 讀取並設定 `rawBody`。這條路徑和本機一致。
- **未能靜態證實的部分**：Vercel runtime 是否會先讀取或改寫 body。必須在 Vercel Preview 實測（6.3），通過後才能部署正式環境。

### 4.5 Plan B（只在 Preview 實測發現 `rawBody` 不可用時才啟用，並先告知使用者）

- 在 `main.ts` 的 `listen()` 之前執行 `app.use("/webhook", express.raw({ type: "application/json" }))`。這個 parser 會比 Nest 的全域 JSON parser 先註冊。它會設定 `req._body`，全域 JSON parser 看到後就會略過，因此 `req.body` 是 Buffer。
- `LineSignatureMiddleware` 改以 `req.body`（Buffer）驗證，**驗證通過後**才 `JSON.parse` 並寫回 `req.body`；解析失敗回 400。controller 不需要修改。
- `express` 已經是 `@nestjs/platform-express` 的相依套件，不需要新增依賴；如果 import 不到，就停下來並告知使用者。

## 5. state / nonce（防 login CSRF）

### 5.1 設計

- **產生**：`state` 與 `nonce` 各用 `crypto.getRandomValues(new Uint8Array(32))` 轉成 base64url（不含 padding，43 字元）。移除所有 `Math.random` 的產生方式。
- **`state` 改成純 CSRF token**：purpose 與 `data.coachId` 改存在 pending 紀錄中，`decodeLineState` 與 `validateState` 都刪除。
- **儲存**：`sessionStorage` 的 `lineLoginPending`，值為 JSON `{ state, nonce, purpose, data, createdAt }`。
  - 所有讀寫都包 try/catch。發生 `SecurityError` 或不可用時，顯示 `瀏覽器封鎖了工作階段儲存空間，請關閉隱私限制或改用其他瀏覽器後重試`，不送出登入。
- **時序**：**先寫入 pending，再 `window.open`**。授權 URL 用 `generateLoginUrl(state, nonce)` 產生，兩個參數都必填。
- **跨視窗**：
  - popup 流程中，驗證與 `processLineAuthCode` 都在主視窗執行，也就是寫入 pending 的那個視窗。
  - 整頁 fallback 在同一個分頁內往返，`sessionStorage` 會保留。
- **postMessage**：
  - 保留現有的 `targetOrigin`（`LineCallback.vue:60`）與 `event.origin` 檢查（`Home.vue:175`、`CoachBind.vue:107`）。
  - **新增 `event.source === popup` 檢查**。
- **popup 競態**：
  - 收到合法 message 時，在任何 `await` 之前**同步**呼叫 `cleanup()`，停止 `closedPoller` 並移除 listener。
  - `closedPoller` 偵測到視窗關閉時，只做 cleanup 與重設 loading，**不清除** pending，交給 TTL 與下一次登入覆蓋。
- **驗證**：`processLineAuthCode(code, stateStr)` 先呼叫 `consumePendingLineLogin(stateStr)`。這個函式**先刪除**紀錄（一次性），再檢查三件事：紀錄存在、`state` 完全相等、建立時間在 10 分鐘內。
  - 失敗時顯示 `登入狀態驗證失敗，請重新登入`，**不呼叫後端**。
  - 成功時以 `api.lineLogin(code, redirectUri, nonce)` 送出，並依 pending 的 `purpose` / `data` 決定綁定教練或一般登入。
- **`LineCallback.vue`**：讀取 `code` / `state` / `error` 後，**立即** `history.replaceState(null, "", "/line-callback")` 清除 query string（popup 與整頁流程都要做）。
- **取消或錯誤的導向**（整頁流程）：讀取 pending 的 `purpose` 後清除紀錄，顯示錯誤，並提供返回按鈕：
  - `bind-coach` 回到 `/bind?coachId=<data.coachId>`；
  - `normal` 或沒有紀錄時回到 `/`。
  - popup 流程中，LINE 回傳 `error` 時由主視窗清除 pending，並顯示錯誤。
- **行動裝置**：在 iOS Safari、Android Chrome 與 LINE in-app browser 上實測（6.2）。如果 popup 在某個環境不可靠，就讓該環境直接走同分頁 redirect（已經存在的 fallback），判斷方式以實測結果為準，並回報使用者。

## 6. 測試

### 6.1 測試環境隔離（由使用者設定；developer 不得讀取任何 `.env*`）

- **本機**：使用者在 gitignored 的 `.env.local` 中設定以下各項，`.env.local` 優先於 `.env`：
  - **本機 DB**（`POSTGRES_*`、`DB_HOST`、`DB_SSL`）；
  - 測試 Messaging channel 的 `LINE_MESSAGE_CHANNEL_SECRET` / `LINE_MESSAGE_CHANNEL_ACCESS_TOKEN`；
  - 測試 LINE Login 的三個 `LINE_LOGIN_*`；
  - Blob token 留空，或使用測試用 token。
- **前端本機**：`VITE_API_URL` 指向本機後端，`VITE_LINE_CHANNEL_ID` 設為測試 LINE Login channel。測試 channel 的 Callback URL 加入 `http://localhost:5173/line-callback`。
- **Vercel Preview（LINE_BOT）**：必須以 Preview scope **明確設定**以下各項，否則會悄悄 fallback 到被追蹤 `.env` 中的正式值：
  - 測試 DB（`POSTGRES_*`、`DB_HOST`）；
  - 測試 Blob token；
  - 測試 channel 的 `LINE_MESSAGE_CHANNEL_SECRET` / `LINE_MESSAGE_CHANNEL_ACCESS_TOKEN`；
  - `LINE_LOGIN_*`。
  - 如果使用者無法提供 Preview 用的測試 DB，Preview 測試就只做 **Verify 按鈕**與**偽造簽章被拒**，不送出任何會寫入 DB 的 event。
- **Deployment Protection**：**不得關閉**。webhook URL 使用 Protection Bypass for Automation 的 query 參數，**不帶** `x-vercel-set-bypass-cookie`，只用於測試 channel。測試結束後由使用者撤銷該 bypass secret。

### 6.2 LINE Login（本機）

1. **curl**：
   - body 為空、缺少 `nonce`、`nonce` 格式不符、`code` 只有空白或含非法字元 → 400；
   - `redirectUri` 不在 allowlist → 400，而且不呼叫 LINE；
   - 假的 `code` → 401；
   - 使用者暫時移除 allowlist env，或把它設成 `http://example.com/x` → 500。
2. **端對端**：
   - Home popup 登入：未註冊、學員、教練三種情況；
   - CoachBind（`/bind?coachId=`）綁定；
   - 封鎖 popup，走整頁 fallback；
   - 在 LINE 授權頁取消（popup 與整頁各一次），整頁流程應依 purpose 提供正確的返回目標；
   - 關閉後端時顯示通用錯誤。
3. **state 不符**：
   - (a) 整頁流程中修改 callback 網址的 `state` → 被拒絕，而且沒有 `/auth/line-login` 請求；
   - (b) 登入成功後重放舊的 callback 網址 → 被拒絕；
   - (c) popup 開啟期間，在主視窗修改 `lineLoginPending.state` → 被拒絕；
   - (d) 把 `createdAt` 改成 11 分鐘前 → 被拒絕。
4. **nonce 不符**：popup 開啟期間，只修改主視窗的 `lineLoginPending.nonce`（保持 43 字元的合法格式）→ 401。
5. **postMessage 來源**：在主視窗 console 執行 `window.postMessage({type:"line-auth-callback",code:"x",state:"y"}, location.origin)` → 被忽略（`event.source` 不是 popup），不呼叫後端。
6. **網址與儲存**：callback 後網址列已經沒有 query string；登入完成後 `sessionStorage` 沒有 `lineLoginPending`；每次登入的 `state` / `nonce` 都不同。
7. **`sessionStorage` 被封鎖**：在 Safari 隱私限制、或以 DevTools 模擬不可用時 → 顯示明確的錯誤訊息。
8. **行動裝置**：在 iOS Safari、Android Chrome、LINE in-app browser 上各完成一次登入與一次 CoachBind 綁定。
9. **Network 與 log**：DevTools Network 中沒有 `api.line.me/oauth2/v2.1/token` 或 `/userinfo` 的請求；後端 log 沒有 code、nonce、token 或 secret。

### 6.3 Webhook 簽章（先本機 ngrok，再 Vercel Preview；都用測試 Messaging channel）

1. 在測試 channel 按 **Verify** → Success；傳一則訊息與一個 postback → 正常處理。
2. 不帶 `x-line-signature` 的偽造請求 → 401。帶錯誤簽章、內容為「產生報表」文字 event 的請求 → 401，而且**沒有副作用**：沒有產生報表、沒有發送訊息、沒有寫入 DB、沒有呼叫 Blob。userId 使用測試帳號，**不得**使用 `coach.entity.ts` 的預設值。
3. 合法簽章但 body 被竄改 → 401；`Content-Type: text/plain` → 401；空 body → 401；格式錯誤的 JSON → 4xx，而且 handler 沒有執行。
4. **route 變體**：對 `POST /webhook/`、`POST /webhook?x=1`、`POST /Webhook` 送出錯誤簽章 → 全部被拒，不得出現 200。
5. 其他 route（`GET /`、`/auth/line-login`、`/view/:socialId`）不受影響。
6. 以非教練測試帳號傳送「產生報表」→ 被拒絕；以教練測試帳號傳送 → 成功（只在有測試 DB 的環境測試）。

### 6.4 Jest 單元測試（LINE_BOT 已設定 Jest，目前沒有任何 spec）

- 新增 `src/middleware/line-signature.middleware.spec.ts`：測試合法簽章、缺少簽章、錯誤簽章、缺少 rawBody（有或沒有 content-length）、非 JSON、空 body、缺少 secret。
- 新增 `src/services/line-login.service.spec.ts`：
  - 以 `jest.spyOn(global, "fetch")` mock 上游；
  - 測試 3.3 的每一種對應，包括逾時（AbortError）與非 JSON 回應；
  - 測試 `nonce` 有原樣傳給 `/verify`；
  - 測試 allowlist 比對與 env 解析（https 規則、localhost 規則、空清單）；
  - 測試 `displayName` 清洗。
- 規則：
  - 使用 `new ConfigService({...})` 注入**假的**測試值（例如 `test-secret`），**不得**載入 `ConfigModule.forRoot` 或 `AppModule`，避免讀取 `.env`；
  - 不得使用真實金鑰或預設 LINE ID。
- 執行：`npx jest src/middleware/line-signature.middleware.spec.ts src/services/line-login.service.spec.ts`。
  - 不新增相依套件。
  - 如果現有的 jest / ts-jest 版本組合無法執行，停下來並回報使用者。

### 6.5 建置與靜態檢查

- **後端**：`npm run build`。lint **禁止** `npm run lint`（它帶有 `--fix`），只對變更檔執行：
  `npx eslint src/main.ts src/app.module.ts src/middleware/line-signature.middleware.ts src/dto/line-login.dto.ts src/services/line-login.service.ts src/controllers/auth.controller.ts`
  - 新檔必須 0 error；
  - 既有檔案不得比修改前多出錯誤；
  - `data.service.ts` 既有的 38 個錯誤不處理。
- **前端**：`npm run build`。不新增 eslint，也不新增 vue-tsc。
- **前端原始碼**（只輸出 FOUND / CLEAN）：
  - `grep -rqE "VITE_LINE_CHANNEL_SECRET|client_secret|api-line|validateState|decodeLineState|Math\.random|oauth2/v2\.1/(token|userinfo)" src/ && echo FOUND || echo CLEAN`
  - `grep -rqE "import\.meta\.env[^.]" src/ && echo FOUND || echo CLEAN`
  - 兩者都必須是 CLEAN。如果 `Math\.random` 命中與登入無關的既有程式，回報檔名後由使用者判斷。
- **Bundle**：`grep -rqE "VITE_LINE_CHANNEL_SECRET|client_secret|oauth2/v2.1/token" dist/ && echo FOUND || echo CLEAN` 必須是 CLEAN。**禁止**用會印出命中內容的指令檢視 bundle。

## 7. 實作任務（依序執行，每項可獨立驗證，並分開 commit）

1. **Webhook 簽章**（獨立 commit）：
   - 修改 `src/main.ts`（`rawBody: true`）；
   - 新增 `src/middleware/line-signature.middleware.ts` 與它的 spec；
   - 修改 `src/app.module.ts` 的 `configure()`。
   - 驗證：6.4（middleware 部分）、6.3（本機）、6.5。
2. **後端 LINE Login**：
   - 新增 `src/dto/line-login.dto.ts`、`src/services/line-login.service.ts` 與它的 spec、`src/controllers/auth.controller.ts`；
   - 在 `app.module.ts` 註冊 `AuthController` 與 `LineLoginService`。
   - 驗證：6.4、6.2 第 1 項。
3. **前端 state / nonce**：
   - 改寫 `src/utils/line-state.ts`：`beginLineLogin`、`consumePendingLineLogin`、`peekPendingPurpose`、`clearPendingLineLogin`；
   - 修改 `src/services/line-login.ts`；
   - 修改 `Home.vue`、`CoachBind.vue`（`event.source` 檢查、同步 cleanup、poller 不清除 pending）；
   - 修改 `LineCallback.vue`（`replaceState`、依 purpose 導向）。
4. **前端改走後端**：
   - `src/services/api.ts` 新增 `lineLogin(code, redirectUri, nonce)`。`message` 是字串時直接使用，否則使用通用訊息；
   - 修改 `src/services/line-auth-flow.ts`；
   - **刪除** `src/services/api-line.ts`；
   - `src/env.d.ts` 刪除 `VITE_LINE_CHANNEL_SECRET`。
   - 驗證：6.2 第 2-9 項、6.5。

## 8. 部署（使用者執行）

### 8.1 部署前檢查

1. **確認 `LINE_MESSAGE_CHANNEL_SECRET` 一致**：使用者確認正式環境實際生效的 `LINE_MESSAGE_CHANNEL_SECRET`，與 LINE Console 中 Messaging API channel 的 secret **完全一致**。
   - 實際生效的值：Vercel 有設定時以 Vercel 為準，否則是被追蹤的 `.env` 中的值。
   - 過去從未驗證過簽章，只要不一致，bot 一上線就會全面停擺。
2. **確認 C-1 的選擇**（第 12 節）。
3. **正式網域**：使用者提供完整的正式入口清單（www、非 www、`*.vercel.app`），全部列入 `LINE_LOGIN_REDIRECT_URIS` 與 LINE Login 的 Callback URL；或者把其他入口全部轉址到單一 host。
4. **確認正式環境的 `LINE_LOGIN_REDIRECT_URIS` 不含 `localhost` / `127.0.0.1`**。
5. （選擇性）在 Vercel 專案設定中查看 function 的執行上限；本計畫不依賴它（見第 3 節）。

### 8.2 順序

1. **只部署 webhook 修正**（任務 1）：
   - 先部署 Preview，依 6.1 的隔離規則跑 6.3；
   - 再於**離峰時段**部署正式環境，部署後**立即**在正式 channel 按 Verify 並傳一則測試訊息；
   - 失敗時用 Vercel **Instant Rollback**；
   - 穩定觀察期：使用者決定**等本地端測試完成後再決定**（2026-11-24）。在使用者明確指定之前，不進行步驟 2。
2. **部署後端 LINE Login**（任務 2）：
   - 在 Production 設定 `LINE_LOGIN_*`（secret 暫時使用現行值），然後部署；
   - 在正式環境 curl 測試 400 / 401 情境。
3. **先從 Managment_Web 的所有 Vercel 環境（Production、Preview、Development）刪除 `VITE_LINE_CHANNEL_SECRET`**，再以**不使用 build cache** 的方式部署新前端（任務 3、4），並在正式環境測試登入與綁定。
4. **輪替 LINE Login secret**（第 9 節）。

### 8.3 回滾限制

- 第 8.2 第 4 步之後，不得回滾前端到第 3 步以前的版本，也不得把任何 secret 放回 `VITE_*`。
- 後端可以回滾到第 1 步之後的任一版本。回滾到第 1 步之前，等於重新開啟偽造 webhook 的漏洞，必須由使用者決定。

## 9. Secret 輪替（由使用者手動操作；developer 與 Claude 不執行）

**LINE Login channel secret（必做；在 8.2 第 3 步驗證通過之後，選在離峰時段）**：

1. LINE Developers Console → 選擇 Provider → **LINE Login channel** → **Basic settings** → **Channel secret**，按 **Issue** 並確認。
2. **從這一刻到第 4 步完成之間，LINE 登入會失敗。**
3. Vercel 的 LINE_BOT 專案 → Settings → Environment Variables，把 Production 的 `LINE_LOGIN_SECRET` 更新為新值。
4. Redeploy 後端（env 變更要重新部署才會生效）。
5. 完成一次正式環境登入，確認恢復正常。
6. **刪除**在輪替前建置、含有舊 secret 的前端部署（尤其是 Preview）。

**Messaging API channel secret（使用者選擇 C-1 (B)，本次不執行；以下保留供日後參考）**：在**流量極低**的時段操作。從 Issue 到後端 redeploy 完成之間，webhook event 會因簽章不符而被拒，可能遺失。

1. 在 Console 的 Messaging API channel → **Basic settings** → **Channel secret** 按 **Issue**。
2. **立即**更新 Vercel Production 的 `LINE_MESSAGE_CHANNEL_SECRET`，然後 redeploy。
3. 按 Verify，並傳一則測試訊息。
4. 新值**只能**放在 Vercel env 與 gitignored 的 `.env.local`，**不得**寫進被追蹤的 `.env`。

## 10. 開發者限制

- **禁止讀取或修改**任何 `.env*`，也不得對它們執行 `git add`、`checkout` 或 `stash`。
- 不得在程式、註解、文件、log、測試資料或 curl 中寫入 `coach.entity.ts` 的 hardcoded 預設 LINE ID。
- 不得印出 `dist/` 的內容；不得執行 `npm run lint`；不得新增相依套件。
- 不得在 LINE Developers 或 Vercel 上執行任何操作。
- 只修改第 7 節列出的檔案。

## 11. 相關風險（範圍外）

1. **`LINE_BOT/.env` 被追蹤，也會隨程式碼部署**（使用者目前選擇維持追蹤）。其中含有 `LINE_MESSAGE_CHANNEL_SECRET`、`LINE_MESSAGE_CHANNEL_ACCESS_TOKEN`、`DB_HOST`、`POSTGRES_PASSWORD` 等正式值（此處只列名稱）。
   - 建議另立任務：移出版控、輪替 Messaging API `LINE_MESSAGE_CHANNEL_SECRET` / `LINE_MESSAGE_CHANNEL_ACCESS_TOKEN` 與 DB 密碼，並把所有正式值改為只在 Vercel env 設定。
   - 這也直接關係到 C-1。
2. **先前的假設有誤**：`training-plan-note` 計畫假設 webhook 的 `userId` 可信。實際上在本計畫部署前，「產生報表」的教練限制可以被偽造的 event 繞過。部署後是否真正有效，取決於 C-1。
3. **沒有 session / JWT**：後端 API 全部沒有驗證。前端登入後只把 socialId 放在 store，後端 API 也直接接受 socialId。
   - CoachBind 可以被任何通過 LINE 登入的人用來綁定任意 `coachId`（綁定接管）。
   - 「產生報表」與綁定流程仍然信任 socialId。
   - 屬於延後處理的 API 驗證專案。
4. **CORS 全開**（`main.ts`）。
5. **沒有 rate limiting**（`/auth/line-login` 每次請求最多呼叫上游 2 次，`/webhook` 也沒有限流）。本次不新增依賴，可以考慮使用 Vercel Firewall 的規則限流。
6. **Webhook 重放與冪等性**：攔截到的合法簽章 event 可以被重放，handler 也沒有以 `webhookEventId` 去重。另立任務處理。
7. **Preview 環境無法 LINE 登入**（已接受的限制）。
8. 舊的 LINE Login secret 殘留在舊 bundle 與舊部署中，輪替後即失效。可另外確認 Managment_Web 的 git 歷史是否曾經 commit 含 secret 的 env 檔（只檢查檔名）。
9. 前端沒有型別檢查工具（不新增 vue-tsc），只能依賴 `vite build` 與手動測試。

## 12. 使用者決定與待提供事項

1. **C-1：選 (B) 維持現狀**（使用者決定，2026-11-24）。`LINE_BOT/.env` 繼續被追蹤，Messaging API `LINE_MESSAGE_CHANNEL_SECRET` 本次不輪替。**已接受的風險**：任何能存取 repo（含 git 歷史）的人都能算出合法簽章並偽造 webhook，本次的簽章驗證只能擋住沒有 repo 存取權的人。第 9 節的 Messaging secret 輪替改為選擇性，不在本次範圍。
2. **正式網域**：使用者之後提供（含 www、非 www、`vercel.app` 是否都是入口）。這是第 8 節部署 LINE Login 的前置條件，不影響實作與本地測試。
3. **Preview 測試 DB 與 Blob token**：使用者之後提供。提供之前，Preview 只做 Verify 與偽造簽章測試（6.1 的縮小範圍），不送會寫入 DB 的 event。
4. **Vercel `maxDuration`**：使用者不確定，已在第 3 節以「總逾時 8 秒，不依賴設定」處理。
5. **webhook 修正的穩定觀察期**：本地端測試完成後由使用者決定。
