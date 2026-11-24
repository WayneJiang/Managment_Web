Status: Approved

# 訓練計畫備註（Training Plan Note）實作計畫

> 文件慣例：文件中不含任何實際的不可見或特殊字元。說明文字以 `U+XXXX` 表示 code point（例如 `U+200B`）；程式碼中以 `\u{XXXX}` 或 `\p{...}` 表示（例如 `\u{2028}`、`\p{Cf}`）；JSON 測試資料以 JSON 的反斜線 u 四位十六進位 escape 送出。

## 1. 目標

在「歷史訓練計畫」的每張計畫卡片顯示**備註 (`note`)**，教練可透過**既有的計畫編輯表單**新增 / 修改 / 清除備註，並將備註加入後端月報 PDF「個人計畫簽到統計」。同時將 LINE 文字指令「產生報表」限制為教練在一對一聊天中才能使用。

已由使用者確認的決策：

- **方案 A**：沿用 `src/views/TrainingPlan.vue` 既有表單。點卡片上的「編輯」→ 表單載入該計畫（含備註）→ 透過既有 `PATCH /trainingPlan/:id` 送出。不在卡片上做 inline 編輯，也不新增 endpoint。
- **權限**：計畫編輯與現有相同，不新增權限邏輯。目前所有卡片（含已結束的計畫）都有「編輯」按鈕，此行為不變。
- **長度上限**：100 字。
- **學員端**：學員看不到備註，只在 UI 層隱藏（見第 10 節、第 13 節）。
- **PDF**：備註加入**後端**月報 PDF「個人計畫簽到統計」（`pdf.service.ts` `generateMonthlySummaryPdf`）。**前端** `TrainingRecordList.vue` 的 jsPDF 匯出**不加入**。
- **「產生報表」限教練、限一對一聊天**（4.6）：這是本計畫**唯一**的授權相關變更，其餘授權問題都留在第 13 節。
- **月報分組改用 id**：`getMonthlySummary` 的 `GROUP BY` 加入 `trainee.id` 與 `coach.id`（4.5）。

## 2. 範圍

### 範圍內

- DB：`TrainingPlan` 資料表新增 `note` 欄位（新 migration 檔）。
- 後端 (`/Users/wayne/Github/LINE_BOT`)：
  - entity、DTO（含正規化與 Unicode 字元驗證）、`createTrainingPlan`、`updateTrainingPlan` 支援 `note`。
  - `line.service.ts` 簽到流程的 `save(trainingPlan)` 改為只更新實際變更的那一個欄位（4.4）。
  - `line.service.ts`「產生報表」指令限教練、限一對一聊天（4.6）。
  - 月報 `getMonthlySummary` 改以 id 分組並帶出各計畫備註；`pdf.service.ts` 個人計畫月報表格新增「備註」欄，並限制最大行數（4.5）。
- 前端 (`/Users/wayne/Github/Managment_Web`)：
  - `TrainingPlan.vue` 表單新增「備註」textarea（新增與編輯模式都適用）。不顯示常駐提示文字（使用者決定）。
  - `TrainingPlanList.vue` 卡片唯讀顯示備註（每張卡片都固定顯示備註欄，沒有內容時內容留白；保留換行、純文字插值）。

### 範圍外

- 卡片上 inline 編輯、新 API endpoint、計畫編輯的新權限規則。
- 除「產生報表」以外的 **API / LINE 指令 / Blob 驗證與授權**（列為後續待辦，另立專案，見第 13 節）。
- 修改 `Coach.socialId` 的 entity default（見第 13 節）。
- API 層依身分過濾備註、備註修改歷程 / 稽核紀錄、樂觀鎖定、依備註搜尋、「產生報表」的冷卻時間或鎖定。
- 新增自動化測試（兩個 repo 目前都沒有測試），以及新增任何依賴（如 `vue-tsc`）。
- **前端** `TrainingRecordList.vue` 的 jsPDF 匯出不加入備註。
- 後端「團體課程簽到統計」PDF、月報總覽頁（`drawPrivateOverview`）不加入備註。
- `pdf.service.ts` 以 `coachName` 分頁、以 `traineeName` 計算學員數的既有邏輯不修改（見第 10 節已知限制）。
- 備註的歷史版本：重新產生月報時使用**當下**的備註，不保留產生當時的版本。
- `TrainingRecordList.vue` 簽到紀錄中「訓練計畫」下拉選單的 label 不顯示備註。
- LINE Bot 其他訊息不顯示備註；可用方案 query builder 使用明確的 `.select([...])` raw 欄位，不受新欄位影響。
- 學員端 `TraineePlanList.vue` 不顯示備註（不修改）。

## 3. 現況查核結果

| 項目 | 結果 |
|---|---|
| **API 驗證 / 授權** | LINE_BOT 的 HTTP API **沒有任何驗證或授權**：`data.controller.ts` 沒有 guard，`src/` 中沒有任何 `UseGuards` 或 `APP_GUARD`。所有 endpoint（含 `PATCH /coach/:id`、`POST/PATCH /trainingPlan`、`GET /trainees`）任何知道 API URL 的人都能呼叫。此為既有狀況，除「產生報表」外**不在本計畫範圍**（見第 13 節）。 |
| **LINE webhook 簽章驗證** | **有驗證**：`app.module.ts:63-71` 對 `/line/*path` 套用 `@line/bot-sdk` 的 `middleware({ channelSecret })`，會驗證 `x-line-signature`。所以 webhook event 中的 `event.source.userId` 可以信任（由 LINE 平台提供，無法偽造）。前提是正式環境的 `CHANNEL_SECRET` 有正確設定（程式碼為 `channelSecret \|\| ""`）。本計畫不修改 `app.module.ts`。 |
| **月報 PDF 的取得途徑**（備註加入後會跟著流出） | 1. `GET /monthlySummary/privateTraining`（`data.controller.ts:180-212`）：直接回傳 PDF，不上傳 Blob，無驗證。<br>2. `GET /cron/monthlySummary`（`:219-303`）：無驗證，任何人都能觸發；上傳 Blob，並以 LINE push 把下載連結傳給 `MONTHLY_SUMMARY_TARGET_SOCIAL_ID` 內的帳號。<br>3. `GET /regenerateReport`（`:305-`）：無驗證；重新產生並上傳，**在回應中直接回傳 Blob URL**。<br>4. LINE 文字指令「產生報表」（`line.service.ts:500-501` → `generateAndSendMonthlySummary` `:964`）：目前 `handleTextMessage` **沒有身分 / 角色檢查**，任何加入此 LINE 官方帳號的使用者（含學員），在任何聊天（含群組）中都能取得下載連結。**本計畫修正此項**（4.6）。 |
| **Blob 儲存方式** | `data.service.ts:1033` `put(\`${month}_個人計畫簽到統計.pdf\`, pdf, { access: "public", allowOverwrite: true, cacheControlMaxAge: 60 })`。`access: "public"`：**任何持有 URL 的人都能下載**。檔名固定並使用 `allowOverwrite`，代表沒有隨機後綴（`@vercel/blob` v2 的 `addRandomSuffix` 預設為 `false`，實作時以套件文件再確認）。URL 可推測；重新產生時覆蓋同一個 URL；CDN 快取最多 60 秒。 |
| **`Managment_Web/api/blobs.js`** | Vercel serverless function：`GET` 以 `list()` 列出 store 中**所有** `.pdf` 的 `url` 等資訊；`DELETE ?url=` 可刪除任意 blob。**沒有任何驗證**，且 `Access-Control-Allow-Origin: *`。前端由 `CoachManage.vue:756` 呼叫。 |
| **LINE 指令處理**（`line.service.ts`） | `handleTextMessage(event: webhook.MessageEvent)`（`:53`）以 `switch (event.message.text)` 分派；使用者 ID 取自 `event.source?.userId`（例如 `:65`、`:73`），聊天類型在 `event.source?.type`（`"user"` / `"group"` / `"room"`）。`case "產生報表"`（`:500`）只呼叫 `generateAndSendMonthlySummary(replyToken)`，此方法只有這一個呼叫者。`LineService` 已注入 `DataService`，但**沒有**注入 Coach repository。 |
| **教練身分查詢** | `DataService.getBySocialId(socialId)`（`data.service.ts:97-116`）以 `coachRepository.findOneBy({ socialId })` 判斷，回傳 `{ id, coach, trainee }`。`Coach` entity 有 `socialId` 與 `@DeleteDateColumn() deletedDate`；TypeORM 的 `find*` 預設**自動排除軟刪除**的資料。<br>**注意 1**：TypeORM 0.3 的 `findOneBy({ socialId: undefined })` 會**忽略該條件並回傳第一筆教練**，所以查詢前必須先驗證 `userId` 格式。<br>**注意 2**：`createCoach` 建立教練時 `socialId` 為 `""`（`:164`）。`coach.entity.ts:23` 的 `socialId` 欄位 default 是一組**寫死的預設 LINE ID**（真實帳號格式）：任何未指定 `socialId` 而建立的教練資料，都會對應到該 LINE 帳號（部署前檢查見第 8 節，修正列入第 13 節）。<br>**注意 3**：`PATCH /coach/:id` 沒有驗證，任何人都能把某位教練的 `socialId` 改成自己的 LINE ID，所以 4.6 的限制可被繞過（見第 13 節）。 |
| 月報資料來源 | `data.service.ts:633-700` `getMonthlySummary()`：query builder + `getRawMany<MonthlySummaryRaw>()`（raw 型別在 `:23-31`）。只查**上個月**（以 `CURRENT_TIMESTAMP` 台北時區計算），篩選 PrivateTraining / FlexPrivate / SemiPrivate。目前分組鍵為 `coach.name`、`trainee.name`、`planType`、月份、`quota`：同名的不同學員 / 教練會被合併。`innerJoin trainingRecord` 會讓每個計畫依簽到次數重複出現。raw SQL 中的別名需加雙引號（見該處註解）。 |
| `pdf.service.ts` 表格行為 | `MonthlySummaryRow`（`:11-19`）。個人計畫表格欄位（`:392-398`）：學員 0.16、方案 0.13、額度 0.08、次數 0.08、簽到日期 0.55。`drawTable`（`:204-265`）：<br>- 欄寬 = 內容寬度 × ratio（A4，`margin: 50`，內容寬約 495pt）。<br>- **會折行**：pdfkit `text(..., { width })` 會自動折行，並處理 `\n`。<br>- **列高會增加**：列高 = 各格 `heightOfString` 的最大值 + padding（6pt × 2）。<br>- **換頁**：若 `y + rowHeight > limit` 就先換頁並重畫頁首與表頭，再畫整列。**單列無法跨頁**，列高超過一頁時會溢出。<br>- **空字串一律顯示為「—」**（`cell \|\| "—"`，`:224`、`:250`）。<br>- 版面：頁首（`drawPageHeader`）約到 `y≈90`，表頭 26pt，`limit = 頁高 842 − bottomLimit 92 = 750`，換頁後表格列約有 **630pt** 可用。字型 `NotoSansTC`，本文 9.5pt（每列開頭設定），行高約 13.7pt。<br>- `generateMonthlySummaryPdf` 以 `coachName` 建立 `Map` 分頁（`:369-375`），以 `Set(traineeName)` 計算學員數（`:417`）。 |
| 後端 TS / regex 支援 | `tsconfig.json` 的 `target` 為 `ES2021`，支援 Unicode property escape（`\p{...}`，需 `u` flag，ES2018 起）；Node.js 也原生支援。 |
| 後端 `ValidationPipe`（`src/main.ts`） | `transform: true, whitelist: true`，**沒有** `forbidNonWhitelisted`，也沒有 `enableImplicitConversion`。未宣告於 DTO 的欄位會被**靜默移除**。`transform: true` 代表 class-transformer 的 `@Transform` 會在 class-validator 驗證**之前**執行。 |
| DTO 使用範圍 | 只有一個 class `TrainingPlanDto`，POST 與 PATCH 共用（`data.controller.ts:113`、`:120`）。 |
| `updateTrainingPlan` 的 editor | 每次 PATCH 都會設定 `editor = body.editor`。只改備註也會更新編輯者，此為既有行為，可接受。 |
| 後端其他寫入點 | `trainingPlanRepository` 的寫入只有 `data.service.ts:290/300`（create/save）、`:355`（update）、`line.service.ts:789`（`save(trainingPlan)`）。已查核 `line.service.ts`：<br>- `:545` 以 `findOne` 載入完整 entity，中間經過多個 `await`。<br>- save 前**只修改其中一個欄位**：剩最後一堂時改 `end`（`:785`），否則改 `start`（`:787`）。判斷使用的是 `:545` 載入時的 `quota`。<br>- `:789` 之後**沒有使用** `save()` 的回傳值，也沒有再讀取 `start` / `end`（只送出回覆訊息）。<br>- `src/` 中**沒有**任何 entity listener（`@BeforeInsert` / `@BeforeUpdate` 等）或 `EventSubscriber`。 |
| 後端讀取 query（`getByTraineeId` L122-136、`getTrainees` L138-149） | 皆為 `leftJoinAndSelect` 選取完整 entity，新增 column 後會自動回傳 `note`，**不需修改**。 |
| TypeORM 設定 | `app.module.ts` 沒有設定 `synchronize`（預設 `false`），schema 只會透過 migration 變更。DB host 由環境變數（`POSTGRES_HOST`）決定，因此執行 migration 前必須確認目標 DB（見 5.1）。 |
| 前端呼叫端 | 唯一呼叫者為 `TrainingPlan.vue:623`（update）/ `:625`（create）→ `stores/trainee.ts` → `services/api.ts` L110-131，直接把整個 `UpdateTrainingPlan` 物件當 body 送出，不需修改。 |
| 前端送出後行為 | `handleSubmit` 成功後（約 `:638`）會重新抓取學員資料，卡片會更新；`resetForm` **只在成功時**執行，API 失敗時輸入的備註不會遺失。 |
| 前端 build / 型別檢查 | `npm run build` = `vite build`，**不做型別檢查**（未安裝 `vue-tsc`，本計畫不新增依賴）。`tsconfig.json` 為 `strict`、`noEmit`，`include` 含 `src/**/*.vue`，但 `tsc` 無法解析 `.vue`，所以 `npx tsc --noEmit` 最多只能檢查 `.ts` 檔，僅供參考。 |
| `TraineeInfo.vue` | 使用的是 **`TraineePlanList.vue`**，學員本人從 LINE 進入時預設會看到計畫列表。 |
| `TrainingRecordList.vue` | 不渲染計畫卡片；只在下拉選單 label 與前端 jsPDF 匯出（L1185-1190）用到計畫資料。不修改。 |
| 先例 | 學員備註：entity `@Column({ default: "" }) note: string;`、DTO `@IsString() @IsOptional() @MaxLength(100)`、前端 `TraineeForm.vue` L117-138（textarea `maxlength="100"`、字數 `x/100`、`@input="validateField('note')"`、錯誤訊息「備註不能超過100字」），且該欄位**僅教練可見**。 |
| 自動化測試 | **兩個 repo 皆無自動化測試**。前端無 test script、無 test 檔；後端雖設定 jest（`testRegex: .*\.spec\.ts$`），但 `src/` 下沒有任何 `*.spec.ts`。本計畫以 build、針對修改檔案的 eslint（不加 `--fix`）與手動測試驗證。 |
| 後端 lint script | `npm run lint` = `eslint "{src,apps,libs,test}/**/*.ts" --fix`，會改寫整個 `src/`，包含使用者未 commit 的 `src/app.module.ts`。**禁止執行**（見第 6 節）。 |
| 最新 migration | `1785680974622-RefactorPlanTypes.ts`。 |

## 4. 架構與取捨

### 4.1 欄位設計

採用：`note character varying NOT NULL DEFAULT ''`（與 `Trainee.note` 一致）。

| 方案 | 優點 | 缺點 | 結論 |
|---|---|---|---|
| `varchar NOT NULL DEFAULT ''` | 與既有 `Trainee.note` 一致；前端不必處理 `null`；既有資料自動為 `''` | 無法區分「未設定」與「空字串」（本功能不需要）；必須在 DTO 擋下 `null`（見 4.3） | **採用** |
| `nullable: true` | 可區分未設定 | 前後端都要處理 `null`；與既有慣例不一致 | 不採用 |
| `varchar(100)` 在 DB 層限制長度 | DB 層防護 | 日後調整上限需再寫 migration | 不採用；長度由 DTO 與前端控制 |
| `text` 型別 | 語意清楚 | Postgres 中無長度的 `varchar` 與 `text` 效能相同；與既有慣例不一致 | 不採用 |
| 獨立 `TrainingPlanNote` 資料表（可保存歷程） | 可做稽核 / 多筆備註 | 過度設計，需新 endpoint，違反已確認方案 A | 不採用 |

### 4.2 正規化與更新語意

**正規化只在一個地方做：後端 DTO 的 `@Transform`**（見 4.3）。service 層不再重複處理。前端送出前也會 `trim()`，那只是為了 UX，不是信任邊界。

- 長度在 1000 以內時，先做 Unicode NFC 正規化，再把換行統一為 `\n`（`\r\n` 與單獨的 `\r` 都轉成 `\n`），最後 `trim()`。只有空白 / 換行的備註會變成 `''`。
- 長度超過 1000 時跳過正規化，直接交給 `MaxLength` 以低成本拒絕，避免對超長字串做 NFC 等運算。
- DTO **不限制換行數量**（100 字內最多約 99 個換行）。UI 卡片已有 `max-h-24` 捲動，PDF 另有前處理與行數上限（4.5）。
- **create**：`note: body.note ?? ""`（`body.note` 已由 DTO 正規化）。
- **update**：只有在 `body.note !== undefined` 時才更新 `note`。
  - 新版前端一律送出 `note`（字串，可為 `''`），所以「清除備註」= 送 `''`。
  - 舊版前端（部署過渡期或瀏覽器快取的舊版）不送 `note`，後端不會把既有備註覆蓋掉。

### 4.3 DTO 驗證（`null`、非字串、不允許的 Unicode 字元）

`@IsOptional()` 會讓 `null` **跳過所有驗證**，`note: null` 會直接寫入 NOT NULL 欄位而產生 500。Postgres 不接受 NUL（U+0000），同樣會產生 500。此外，控制字元、格式字元（零寬、BiDi 等）可用來隱藏或倒置顯示文字，孤立的 surrogate 會造成編碼錯誤。因此**不使用 `@IsOptional()`**，改用 Unicode property 規則：

```ts
@Transform(({ value }) =>
  typeof value === "string" && value.length <= 1000
    ? value.normalize("NFC").replace(/\r\n?/g, "\n").trim()
    : value,
)
@ValidateIf((_, value) => value !== undefined)
@IsString()
@MaxLength(100)
@Matches(
  /^(?:[\t\n\u{200D}]|[^\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Cn}\u{2028}\u{2029}])*$/u,
  { message: "備註不可包含控制字元或隱形字元" },
)
note?: string;
```

拒絕的字元類別（`u` flag 下以 code point 判斷）：

| 類別 | 內容 | 例子（code point） |
|---|---|---|
| `\p{Cc}` | C0 / C1 控制字元與 DEL（只例外允許 `\t`、`\n`） | U+0000、U+0007、U+001B、U+007F、U+0085、U+009B |
| `\p{Cf}` | 所有格式字元：零寬字元、方向標記、BiDi embedding / override / isolate、Tag 字元、軟連字號等 | U+200B、U+200E、U+200F、U+202A 至 U+202E、U+2066 至 U+2069、U+061C、U+00AD、U+FEFF、U+E0001 |
| `\p{Cs}` | 孤立的 surrogate（不成對的 UTF-16 code unit） | 單獨的 U+D800；成對的 surrogate（例如 U+2A736，程式碼中寫成 `\u{2A736}`）在 `u` flag 下視為一個正常字元，**允許** |
| `\p{Co}` | 私人使用區 | U+E000、U+F0000 |
| `\p{Cn}` | 尚未指派的 code point | U+0378 |
| `\u{2028}`、`\u{2029}` | Unicode 行 / 段落分隔符號（屬 `Zl` / `Zp`，不在 `C*` 內，所以另外列出） | U+2028、U+2029 |

- `@Transform` 先執行，所以 `MaxLength` 計算的是**正規化後**的長度。
- 非字串原樣傳下去：`null`、`123`、`{}`、`[]` 在 `IsString` 失敗，回 **400**。
- `undefined`（未帶欄位）跳過驗證，相容舊前端。
- `\r` 已在 Transform 中轉成 `\n`，所以不會被誤擋。
- regex 由互斥的字元類別組成，沒有巢狀量詞，不會發生災難性回溯。
- **例外允許 ZWJ（U+200D）**：使用者於核准後決定不擋組合式 emoji（例如舉重女性 emoji、家庭 emoji）（2026-11-24）。ZWJ 不影響文字方向，風險低；單獨出現的 ZWJ 也會被接受並存入。PDF 字型不支援 emoji，會顯示為方框（已知限制）。單一 emoji 與 variation selector（U+FE0F，屬 `Mn`）本來就不受影響。
- `\p{Cn}` 依 Node.js 內建的 Unicode 版本判斷，比 Node 版本更新的字元會被視為未指派而拒絕，可接受。
- 規則中沒有以數值寫出的控制字元，預期不會觸發 eslint `no-control-regex`；若觸發，在該行加上 disable 註解。

### 4.4 簽到流程的 lost update（`line.service.ts`）

目前簽到流程在 `:545` 載入計畫，經過多個 `await` 後，在 `:789` 執行 `trainingPlanRepository.save(trainingPlan)`。TypeORM 的 `save` 會拿記憶體中的 entity 與 DB 目前的資料比對，並寫回所有不同的欄位。如果教練在這段期間修改了備註（或額度、教練等欄位），`save` 會用**載入時的舊值把新值蓋回去**。

修正：把 `:784-789` 改為**只更新實際變更的那一個欄位**：

```ts
if (trainingPlan.quota - usedQuota === 1) {
  trainingPlan.end = dayjs().toDate();
  await this.trainingPlanRepository.update(
    { id: trainingPlan.id },
    { end: trainingPlan.end },
  );
} else {
  trainingPlan.start = dayjs().toDate();
  await this.trainingPlanRepository.update(
    { id: trainingPlan.id },
    { start: trainingPlan.start },
  );
}
```

- 已查核（第 3 節）：兩個分支各只改一個欄位；`:789` 之後沒有使用 `save()` 回傳值；`src/` 沒有 entity listener 或 subscriber，所以改用 `update()` 不會漏掉任何 hook。實作時要再確認一次，若有差異必須停下來回報。
- `update()` 仍會自動更新 `@UpdateDateColumn`。
- 記憶體中的 `trainingPlan` 仍維持指定後的值，與原本行為一致。
- 判斷分支用的 `quota` 仍是 `:545` 載入時的值（既有行為，見第 10 節已知限制），本計畫不修改。

### 4.5 月報 PDF「個人計畫簽到統計」加入備註

#### 查詢（`data.service.ts` `getMonthlySummary`）

1. **分組改用 id**（使用者決策 B）：保留既有分組鍵，並加上 `.addGroupBy("trainee.id").addGroupBy("coach.id")`。排序改為 `coach.name` → `coach.id` → `trainee.name` → `trainee.id`（新增 `.addOrderBy("coach.id", "ASC")` 與 `.addOrderBy("trainee.id", "ASC")`），讓同名列的順序固定。
   - 名字都不同時，列數與修改前相同；只有**同名的不同學員 / 教練**會從一列拆成多列。
   - 加入 id 後，只有在**同一學員、同一教練、同一方案類型、同一額度、同一個月**有多個計畫時，才會合併成一列。
2. **備註彙總**：以 `(計畫 id, 備註)` 為單位彙總，交給 TS 端去重與排序：
   ```ts
   .addSelect(
     `JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', "trainingPlan"."id", 'note', "trainingPlan"."note")) FILTER (WHERE "trainingPlan"."note" <> '')`,
     "notes",
   )
   ```
   - 為什麼不用 `ARRAY_AGG(DISTINCT note ORDER BY ...)`：Postgres 規定 `DISTINCT` 彙總的 `ORDER BY` 必須是同一個運算式，無法同時「依備註去重」又「依計畫 id 排序」。而且 `trainingRecord` 的 join 會讓同一計畫重複出現，需要以計畫為單位去重。
   - `DISTINCT` 作用在 `{id, note}` 物件上（`jsonb` 支援相等比較），同一計畫重複的列會被合併成一筆。
   - 沒有任何備註時結果為 `NULL`。
   - node-postgres 會把 `jsonb` 直接轉成 JS 陣列與物件，不需要分隔字元或備案。
3. 型別與對應：
   - `MonthlySummaryRaw`（`:23-31`）加 `notes: { id: number; note: string }[] | null`。
   - `getMonthlySummary` 的回傳型別（`:634-642`）加 `notes: string[]`。
   - `results.map` 中：`(result.notes ?? [])` 依 `id` **由小到大排序**（等同計畫建立順序），取出 `note`，得到 `notes: string[]`。顯示格式由 `pdf.service.ts` 決定。

#### 版面（`pdf.service.ts`）

- `MonthlySummaryRow`（`:11-19`）加 `notes: string[]`。
- 欄位比例（`:392-398`），主要從「簽到日期」挪出寬度，加總仍為 1：

  | 欄位 | 原 ratio | 新 ratio | 約略寬度（內容寬 495pt） |
  |---|---|---|---|
  | 學員 | 0.16 | 0.14 | 69pt |
  | 方案 | 0.13 | 0.12 | 59pt（所有方案名稱都是 4 字，約 38pt + padding 12pt） |
  | 額度 | 0.08 | 0.08 | 40pt |
  | 次數 | 0.08 | 0.08 | 40pt |
  | 簽到日期 | 0.55 | 0.33 | 163pt（每行約 4 個日期） |
  | 備註（新增，靠左） | — | 0.25 | 124pt（扣除 padding 約 112pt，9.5pt 中文每行約 11 字） |

- **備註儲存格文字**（body 組列時產生）：
  1. 對每一段備註做前處理：**換行一律改成空白**（使用者於核准後決定，2026-11-24），並合併連續空白：
     ```ts
     const clean = (note: string) => note.replace(/\s+/g, " ").trim();
     ```
     `\s` 涵蓋 `\n`、`\t`、一般空白與其他 Unicode 空白。`\t` 也因此換成空白，避免字型沒有 tab 字形。網頁卡片仍保留換行，只有 PDF 不分行。
  2. `(row.notes ?? []).map(clean).filter(Boolean)`，再去除內容相同的段落（保留第一次出現的位置，順序仍依計畫 id）。
  3. 只有一段時直接使用；兩段以上時，每段前面加「• 」，以 `\n` 連接（段落之間換行，段內不換行）。
- **不截斷、不加「…」**（使用者於核准後決定，2026-11-24）：備註完整顯示。輸入端已限制最多 100 字，換行又改成空白，因此單一備註最多約 10 行（約 140pt），不需要行數上限。移除先前的 `maxLines` 與 `ellipsis` 設計。
  - 剩餘風險：同一列合併 4 個以上、各 100 字的計畫，列高才可能接近一頁（約 630pt）；這需要同一學員、同一教練、同一方案、同一額度在同月有 4 個以上計畫，實務上不會發生，接受此風險。
  - 若直接修改 DB 寫入超過 100 字，PDF 也完整顯示（使用者表示備註本來就只能輸入 100 字，不另外處理）。
- **空備註顯示為空白**：`drawTable` 目前把空字串畫成「—」。最小修改如下：
  - `TableColumn` 加選填 `emptyText?: string`，備註欄設 `emptyText: ""`。
  - `drawTable` 的顯示文字為 `cell || (columns[index].emptyText ?? "—")`。
  - **顯示文字為空字串時，跳過 `heightOfString` 量測與 `text` 繪製**（不納入列高計算）。其他欄位一定有內容，所以列高不會變成只有 padding。
  - 其他表格與欄位的行為不變。
- **折行與換頁**：沿用 `drawTable` 既有機制。換頁前會先判斷整列高度，不會重疊或把一列切開；加上行數上限後，單列高度有上界，不會超過一頁。
- 長的英數字串或 URL（無空白）：pdfkit 對超過欄寬的單字會強制斷開，需在測試中確認（9.5）。
- 字型 `NotoSansTC` 沒有 emoji 字形，emoji 在 PDF 中可能顯示為空白或方框，屬已知限制，不處理。

### 4.6 「產生報表」限教練、限一對一聊天（`line.service.ts`）

- `case "產生報表"`（`:500-501`）改為傳入事件來源：`await this.generateAndSendMonthlySummary(replyToken, event.source)`。
- `generateAndSendMonthlySummary(replyToken: string, source?: webhook.Source)`（`:964`）在**最前面**依序檢查。檢查放在方法內部，日後若有其他呼叫者也會一併受到保護：
  ```ts
  const LINE_USER_ID = /^U[0-9a-f]{32}$/;

  // 1. 只允許一對一聊天（群組 / 多人聊天室中的連結會被其他成員看到）
  if (source?.type !== "user") {
    await this.messagingApiClient.replyMessage({
      replyToken,
      messages: [{ type: "text", text: "請於一對一聊天中使用此功能" }],
    });
    return;
  }

  // 2. 先驗證 userId 格式（涵蓋 undefined、""、空白等），再查詢教練身分
  const socialId = source.userId;
  const isCoach =
    typeof socialId === "string" && LINE_USER_ID.test(socialId)
      ? (await this.dataService.getBySocialId(socialId)).coach
      : false;
  if (!isCoach) {
    await this.messagingApiClient.replyMessage({
      replyToken,
      messages: [{ type: "text", text: "此功能僅限教練使用" }],
    });
    return;
  }
  // 以下為既有流程：generateMonthlySummaryPdfs() → 上傳 → 回覆連結
  ```
- **必須先驗證 `userId` 格式**：`findOneBy({ socialId: undefined })` 會忽略條件並回傳第一筆教練；`""` 也可能對到尚未綁定 LINE 的教練（`createCoach` 預設 `""`）。格式不符一律視為非教練，不查詢 DB。
- `userId` 來自已驗證簽章的 webhook（第 3 節），可以信任。
- 使用既有的 `DataService.getBySocialId`，不需要在 `LineService` 注入 Coach repository，也**不需修改受保護的 `src/app.module.ts`**。軟刪除的教練會被 `findOneBy` 自動排除。
- **被拒絕時回覆簡短訊息**，而不是不回應：
  - 使用者已看到 loading 動畫（`:64-67`），不回應會讓人以為系統故障。
  - 這個指令的存在本來就不是秘密。
  - 不會產生、上傳或傳送任何報表。
- 這是本計畫**唯一**的授權變更，屬於降低風險而非完整防護：`PATCH /coach/:id` 等 API 沒有驗證，仍可能被用來竄改教練的 `socialId`（見第 13 節）。

## 5. DB Migration 設計

新增檔案（**新檔案**，不可修改任何既有 migration，特別是使用者有未 commit 變更的 `1761836394915-GenerateTables.ts`）：
`/Users/wayne/Github/LINE_BOT/database/migrations/<timestamp>-AddNoteToTrainingPlan.ts`

- **timestamp**：`Math.max(Date.now(), maxExisting + 1)`。`maxExisting` 是 `database/migrations/` 中所有檔名 timestamp 的最大值（目前為 `1785680974622`）。命名前要確認結果大於 `maxExisting`。class 名稱與 `name` 屬性使用同一 timestamp。

```ts
export class AddNoteToTrainingPlan<timestamp> implements MigrationInterface {
  name = "AddNoteToTrainingPlan<timestamp>";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "TrainingPlan" ADD "note" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "TrainingPlan" DROP COLUMN "note"`);
  }
}
```

- 手寫，不用 `npm run typeorm:generate`（generate 會比對整個 schema，可能把其他不一致一起產生進來）。
- `down()` 會**永久刪除**欄位與所有備註資料，僅作最後手段（見第 8 節 rollback）。

### 5.1 安全閘門（任務 1 之前必做）

1. **由使用者本人確認**以下事項，developer **不可讀取**這些檔案（`.env`、`database/ormconfig.ts`、`src/app.module.ts`）來自行判斷：
   - 使用者未 commit 的 `database/ormconfig.ts`、`src/app.module.ts` 與 `.env` 所指向的 DB 是**本地、可丟棄的開發 / 測試 DB**，不是正式或共用 DB，並告知預期的 **DB 名稱**。
   - 本地 DB **只包含虛構的測試資料**，沒有正式環境的學員、教練或備註資料。
   - 本地使用的 **LINE channel token** 不是正式環境的 token（或使用測試用 channel）。
   - 本地的 **Blob token** 不是正式環境的 token，或本地未設定（空白）。
   - 使用者未明確確認前，不可執行任何 `typeorm:*` 指令，也不可啟動後端進行測試。
2. **唯讀連線檢查**（不讀取任何設定檔或密碼）：在執行 `typeorm:run` / `typeorm:revert` **之前**，透過既有的 DataSource 執行：
   ```bash
   npx typeorm-ts-node-commonjs -d ./database/ormconfig.ts query "SELECT inet_server_addr(), current_database();"
   ```
   只有在以下條件**全部**成立時才繼續，否則中止並回報：
   - `inet_server_addr()` 為 `NULL`（unix socket）、`127.0.0.1`、`::1`，或本地 docker 網路的私有位址（例如 `172.16.0.0/12` 內）。
   - `current_database()` 等於使用者在步驟 1 告知的 DB 名稱。
3. 執行 `npm run typeorm:show`，確認待執行的 migration **只有**新增的這一筆。若出現其他待執行的 migration，立即停止並回報。
4. 執行 `npm run typeorm:run`。**只有在 run 成功後**才執行 `npm run typeorm:revert` 驗證 down，最後再 `typeorm:run` 一次。每次執行 `run` / `revert` 前都重做步驟 2 的檢查。
5. 正式環境的 migration 由使用者依第 8 節部署順序執行，不在 developer 任務內。

## 6. 後端變更（`/Users/wayne/Github/LINE_BOT`）

**警告：LINE_BOT 目前有使用者未 commit 的變更。以下檔案絕對不可修改、覆蓋、格式化、還原或 stage：**
`.env`、`.gitignore`、`README.md`、`database/migrations/1761836394915-GenerateTables.ts`、`database/ormconfig.ts`、`src/app.module.ts`、`docker-compose.yml`、`scripts/`。

規則：

- 只修改下列 5 個檔案，並新增 1 個 migration 檔：
  - `src/entities/training-plan.entity.ts`
  - `src/dto/training-plan.dto.ts`
  - `src/services/data.service.ts`
  - `src/services/line.service.ts`
  - `src/services/pdf.service.ts`
  - `database/migrations/<timestamp>-AddNoteToTrainingPlan.ts`（新檔）
- `src/controllers/data.controller.ts`、`src/entities/coach.entity.ts` **不需修改**。
- **禁止 `npm run lint`**（會對整個 `src/` 執行 `--fix`）與 `npm run format`。只允許對本次修改的檔案執行不帶 `--fix` 的 `npx eslint <changed files>`，有問題時手動修正。
- 禁止 `git checkout .`、`git restore .`、`git stash`、`git add .`、`git add -A` 等全域指令。
- **不可讀取 `.env` 內容**。不可對 `.env`、`database/ormconfig.ts`、`src/app.module.ts`、`docker-compose.yml`、`scripts/` 執行 `git diff`，也不可保存其內容。這些檔案只用雜湊值比對（見第 11 節任務 0 / 任務 8）。
- 所有手動 / curl 測試**只能**對本地或測試環境執行，並在 5.1 通過後進行。
- **本地測試 PDF 內容時只用 `GET /monthlySummary/privateTraining`**（直接下載，不上傳）。不可在本地呼叫 `GET /cron/monthlySummary`、`GET /regenerateReport`。只有測試「產生報表」的**教練成功路徑**（9.7 第 44 項）會上傳 Blob，必須在使用者確認 Blob token 與 LINE channel 都是測試用的之後才能執行，並在測試後刪除上傳的檔案。
- 文件與程式碼中若需要表示特殊字元，一律使用 escape（程式碼用 `\u{XXXX}` / `\p{...}`），不可貼上實際的不可見字元。

變更內容：

1. `src/entities/training-plan.entity.ts`
   - 在 `quota` 後新增 `@Column({ default: "" }) note: string;`。
2. `src/dto/training-plan.dto.ts`
   - import：`class-validator` 加 `IsString`、`MaxLength`、`Matches`（`ValidateIf` 已 import）；`class-transformer` 加 `Transform`（`Type` 已 import）。
   - 依 4.3 新增 `note?: string`。此 DTO 同時套用於 POST 與 PATCH。
3. `src/services/data.service.ts`
   - `createTrainingPlan`（L290-296）：`create({...})` 加 `note: body.note ?? ""`。
   - `updateTrainingPlan`（L355-363）：update 物件加 `...(body.note !== undefined && { note: body.note })`（或等效寫法）。
   - `getMonthlySummary`（L633-700）、`MonthlySummaryRaw`（L23-31）：依 4.5 加入 id 分組、排序與 `notes` 彙總（`JSONB_AGG`，TS 端依計畫 id 排序）。
   - 其他讀取 query、`getBySocialId` 與 `generateMonthlySummaryPdfs`（L1004-1056）不需修改。
4. `src/services/line.service.ts`
   - `:784-789`：依 4.4 改為只 `update` 變更的欄位。
   - `:500-501` 與 `:964`：依 4.6 傳入 `event.source`，並加上一對一聊天、`userId` 格式與教練身分檢查。
5. `src/services/pdf.service.ts`
   - 依 4.5：`MonthlySummaryRow` 加 `notes`；`TableColumn` 加 `emptyText?`；`drawTable` 套用空字串略過（不設行數上限、不截斷）；個人計畫表格調整欄寬並新增「備註」欄（含每段前處理、去重、「• 」前綴）。
6. 新 migration（第 5 節）。

驗證：
- `npm run build`
- `npx eslint src/entities/training-plan.entity.ts src/dto/training-plan.dto.ts src/services/data.service.ts src/services/line.service.ts src/services/pdf.service.ts database/migrations/<timestamp>-AddNoteToTrainingPlan.ts`（不加 `--fix`）

## 7. 前端變更（`/Users/wayne/Github/Managment_Web`）

1. `src/services/training-plan.ts`
   - `TrainingPlan` 加 `note?: string;`（選填，可容忍後端尚未部署時沒有此欄位）。
   - `UpdateTrainingPlan` 加 `note?: string;`。
2. `src/views/TrainingPlan.vue`
   - 狀態：新增 `const note = ref<string>("");`；`validationErrors` 初始值以及 `validateForm` / `resetForm` 內的 errors 物件都加 `note: ""`。
   - 範本：在「計畫額度」區塊與「訓練時段設定」之間新增全寬卡片，參照 `TraineeForm.vue` L117-138：
     - `<label for="training-plan-note">`，內含「備註」文字與字數 `{{ note.length }}/100`。
     - `<textarea id="training-plan-note" v-model="note" class="textarea w-full" maxlength="100" rows="3" placeholder="請輸入備註（最多100字）..." @input="validateNote">`，錯誤時加 `textarea-error`。
     - **保留 `maxlength="100"`**（與 `TraineeForm.vue` 相同），它是主要的長度限制；`validateNote` / `validateForm` 是防禦性檢查。
     - **不顯示常駐提示**：使用者於核准後決定移除 textarea 下方的提示文字（2026-11-24）。改由部署前通知教練（第 8 節）提醒備註會出現在月報、不可寫入敏感資料。
     - 錯誤訊息區塊（樣式比照本檔其他欄位，`var(--color-error)`）。
     - 樣式沿用本檔的 CSS 變數（`--color-input-bg`、`--color-input-border`、`--color-text`）。
     - 新增與編輯模式都顯示，所有計畫類型（含 GroupFitness、FlexPrivate）都顯示。
   - `validateNote()`：比照 `TraineeForm.vue` 的 `validateField('note')`。`note.value.length > 100` 時設定 `validationErrors.value.note = "備註不能超過100字"`，否則清空。
   - `validateForm`：加入相同的長度檢查。
   - `handleSubmit`：`data` 加 `note: note.value.trim()`（一律送出，清除時為 `''`）。
   - `resetForm`：`note.value = ""`（既有流程只在成功時呼叫，失敗時保留輸入）。
   - `handleEditTrainingPlan`：`note.value = trainingPlan.note ?? ""`，並清除 `validationErrors.value.note`。這也涵蓋「編輯 A 途中點 B 的編輯」。
3. `src/components/TrainingPlanList.vue`
   - 卡片根元素（grid item，`v-for` 的那層 `div.card`）加上 `min-w-0`，避免長 URL 撐寬 grid 欄位。
   - 在「編輯者」區塊之後、操作按鈕之前新增：
     ```vue
     <div class="mb-4 min-w-0">
       <!-- icon + 「備註」標題，樣式比照「編輯者」區塊 -->
       <div class="text-sm whitespace-pre-line break-words max-h-24 overflow-y-auto">{{ trainingPlan.note?.trim() }}</div>
     </div>
     ```
   - **每張卡片都固定顯示備註欄**：使用者於核准後決定（2026-11-24）。備註為空、只有空白或欄位不存在時，仍顯示「備註」標題，內容留白。
   - 只用 `{{ }}` 純文字插值，**禁止 `v-html`**（避免 XSS）。
   - `whitespace-pre-line` 保留換行；`min-w-0` + `break-words` 處理長字串；`max-h-24 overflow-y-auto` 避免大量換行拉長卡片。
   - `{{ }}` 與標籤之間不要有多餘空白或換行，否則 `whitespace-pre-line` 會顯示出來（如上寫成同一行）。
4. `src/components/TraineePlanList.vue`：**不修改**。
5. `TrainingRecordList.vue`（含 jsPDF 匯出）、`TraineeInfo.vue`、`stores/trainee.ts`、`services/api.ts`、`api/blobs.js`：不修改。

驗證：
- `npm run build`（`vite build` 不做型別檢查）。
- （可選，僅供參考）若現有 `tsconfig.json` 可直接執行，跑 `npx tsc --noEmit`。它只檢查 `.ts` 檔，不檢查 `.vue`；既有錯誤不阻擋本任務，但本次修改的 `.ts` 檔不應新增錯誤。不新增任何依賴。

## 8. 部署順序、相容性與 Rollback

順序：**migration → 後端（含 PDF 與「產生報表」變更）→ 前端**。

| 狀態 | 行為 |
|---|---|
| 已跑 migration、後端舊版 | 舊 entity 不知道 `note` 欄位，INSERT 使用 DB default `''`；舊版簽到的 `save` 也不碰此欄位；舊月報不含備註。正常。 |
| 後端新版、前端舊版（含瀏覽器快取的舊版） | 舊前端不送 `note`：create 存 `''`；update 不覆蓋既有備註。月報已含備註欄（可能全為空白）；「產生報表」已限教練。正常。 |
| 前端新版、後端舊版（順序錯誤時） | `whitelist: true` 會**靜默移除** `note`，請求成功並顯示「更新成功」，但備註**沒有被儲存**。因此必須先部署後端。 |
| 後端新版但 migration 未跑 | 新 entity 與月報查詢都會讀取 `note` 欄位而產生 SQL 錯誤：**所有讀取學員 / 計畫的 API、月報下載、月度 cron 與「產生報表」都會失敗**。migration 必須最先執行。 |

### 部署前檢查（由使用者執行）

1. **教練 `socialId` 檢查**：使用者在正式 DB 以唯讀查詢列出可能有問題的在職教練，逐一確認是否符合預期：
   ```sql
   SELECT id, name, "socialId"
   FROM "Coach"
   WHERE "deletedDate" IS NULL
     AND (
       "socialId" = '<coach.entity.ts:23 寫死的預設 LINE ID>'
       OR "socialId" = ''
       OR "socialId" !~ '^U[0-9a-f]{32}$'
     );
   ```
   - 對應到「寫死的預設 LINE ID」的教練：確認該 LINE 帳號確實應擁有這些教練身分；若不是，請先修正 `socialId`，否則該帳號可使用「產生報表」。
   - 空值或格式不符的教練：部署後無法使用「產生報表」；若需要使用，請先綁定正確的 LINE ID。
   - 查詢結果含 LINE ID，屬個人識別資料，只在使用者本機檢視，不要貼到外部服務。
   - 本計畫**不修改** entity 的 default（列入第 13 節）。
2. **通知教練**：
   - 備註**只會**出現在「個人計畫簽到統計」月報，**不會**出現在「團體課程簽到統計」月報。
   - 重新產生報表時使用當下的備註。
   - 月報可能被轉傳或公開取得（第 10 節），請勿填寫醫療或敏感個人資料。
   - 「產生報表」改為只有教練能使用，且必須在與官方帳號的**一對一聊天**中使用；教練的 LINE 帳號必須已綁定（`Coach.socialId` 已設定）。
3. 確認正式環境的 `CHANNEL_SECRET` 已設定（webhook 簽章驗證依賴它，第 3 節）。由使用者確認，developer 不讀取。

部署後：下一次月度 cron、「產生報表」或 `regenerateReport` 產生的 PDF 會開始包含備註，並以 `access: "public"` 覆蓋同名 Blob（見第 10 節）。

### Rollback

- **預設做法**：回退前端，再回退後端，**保留 DB 欄位**。舊後端與舊前端都忽略該欄位，既有備註資料保留，日後重新上線即可恢復顯示。注意：回退後端也會讓「產生報表」恢復成任何人、任何聊天都能使用。
- **Blob 上含備註的 PDF**：回退後端不會自動移除已上傳的 PDF。若需要移除：
  - 後端回退後，以舊版後端重新產生受影響的月份（`GET /regenerateReport` 或教練傳「產生報表」），用不含備註的 PDF 覆蓋同名檔案；或
  - 在 Vercel Blob dashboard 直接刪除受影響的 PDF。
  - 覆蓋或刪除後，CDN 快取最多還會保留 60 秒（`cacheControlMaxAge: 60`）。已被下載或轉傳的檔案無法收回。
- **快取的新前端**：後端已回退、但使用者瀏覽器仍快取著新版前端時，新前端送出的 `note` 會被舊後端的 `whitelist` **靜默丟棄**。應先回退前端並請使用者重新整理，確認快取已更新後再回退後端。
- **最後手段**：只有確定要永久移除此功能時才執行 `npm run typeorm:revert`，它會**永久刪除所有備註資料**。執行前先以 **JSON** 備份：
  - 在 `umask 077` 下，以 psql 的 unaligned / tuples-only 模式輸出，例如：
    ```bash
    umask 077
    psql <連線參數> -At -c "SELECT COALESCE(json_agg(json_build_object('id', id, 'note', note) ORDER BY id), '[]') FROM \"TrainingPlan\" WHERE note <> ''" -o '<路徑>/training-plan-note-backup.json'
    ```
  - 不要用 `\copy ... TO` 輸出 JSON：COPY 的 text 格式會再跳脫反斜線，導致 JSON 內容被改變。
  - `<路徑>` 必須在**兩個專案目錄以外**，且是**沒有雲端同步**（iCloud、Dropbox、Google Drive 等）的本機資料夾。
  - 備份屬於客戶資料，只用純文字編輯器或 `jq` 檢視。
  - 復原完成或確定不再需要後，**刪除備份檔**。

## 9. 測試計畫（手動）

**所有測試只能在本地或測試環境執行**，並在 5.1 安全閘門通過後進行。本地 DB 只能有虛構的測試資料。PDF 內容測試只用 `GET /monthlySummary/privateTraining`（見第 6 節）。

以下以 `U+XXXX` 表示要放入 `note` 的字元。curl / Postman 送出時，在 JSON 字串中以反斜線 u 加 4 位十六進位的 escape 表示（U+10000 以上的字元以兩個 surrogate escape 表示），不要直接貼上實際字元。

前置：`npm run typeorm:run` 後，以 `\d "TrainingPlan"` 確認欄位存在，且既有資料 `note = ''`。

### 9.1 API 驗證（任務 3 完成後；POST `/trainingPlan` 與 PATCH `/trainingPlan/:id` 都要測）

只檢查驗證是否擋下，不需要確認寫入：

1. `note` 為 `null`、`123`、`{}`、`[]`：回 **400**（不可為 500）。
2. C0 控制字元：`"a"` + U+0000 + `"b"`、U+0007、U+001B、U+007F：回 **400**，訊息為「備註不可包含控制字元或隱形字元」。
3. C1 控制字元：U+0085、U+009B：回 400。
4. 格式字元：U+200B、U+200E、U+200F、U+FEFF、U+061C、U+00AD、Tag 字元 U+E0001（surrogate pair `DB40 DC01`）：回 400。
   - 含 ZWJ 的組合 emoji（例如 U+1F3CB U+FE0F U+200D U+2640 U+FE0F）：通過並原樣存入。
5. BiDi 控制字元：U+202A、U+202E、U+2066、U+2069：回 400。
6. 行 / 段落分隔符號：U+2028、U+2029：回 400。
7. 孤立 surrogate：U+D800（單獨，沒有成對）：回 400。
8. 私人使用區 U+E000、未指派字元 U+0378：回 400。
9. 成對 surrogate：U+2A736（surrogate `D869 DF36`）：**通過**。
10. `\t`、`\n`、`\r\n`、單獨的 `\r`：通過。
11. `note` 為 101 字：回 400。
12. `note` 為 100 字加上前後空白：通過（trim 後才計算長度）。
13. `note` 為 5000 字：回 400（跳過正規化，由 `MaxLength` 拒絕），回應時間正常。
14. NFC：`note` 為分解形式（`e` + U+0301）：通過。

### 9.2 API 寫入（任務 4 完成後）

15. `note` 為 100 字：成功，DB 存入完整 100 字。
16. `note` 含 `\n`、`\t`、`\r\n`、`\r`：成功；`\r\n` 與 `\r` 都存為 `\n`。
17. `note` 為 `"  abc  "`：DB 存為 `"abc"`；`"   "` 或 `"\n\n"`：DB 存為 `''`。
18. **清除**：先存入備註，再 PATCH `note: ""`，DB 變為 `''`。
19. **舊版前端相容**：POST 不帶 `note`，成功且 DB 為 `''`；PATCH 不帶 `note`，成功且既有備註不被清除。
20. 第 14 項的分解形式字串：DB 存為 NFC 組合形式 U+00E9（以 `SELECT encode(convert_to(note, 'UTF8'), 'hex')` 確認為 `c3a9`）。
21. 第 9 項的 U+2A736：DB 存入後再讀出，字元完整不變（hex 為 `f0aa9cb6`）。

### 9.3 簽到流程迴歸（任務 5 完成後，使用測試 LINE channel）

22. 為某計畫寫入備註後，以學員身分在 LINE 簽到：
    - 簽到紀錄建立成功，回覆訊息正常。
    - 非最後一堂：只有 `start` 更新；剩最後一堂時：只有 `end` 更新。行為與修改前相同。
    - 備註、`quota`、`planType`、`coach` 皆不變。
23. （可選）在簽到流程的 `update` 之前設中斷點，同時用前端修改該計畫的備註與額度，放行後確認兩者都**未被**舊值覆蓋。

### 9.4 「產生報表」權限（任務 6 完成後，使用測試 LINE channel）

被拒絕的情況都必須確認**沒有**產生或上傳任何 PDF：可用 log、測試 Blob 的 `uploadedAt` 未變，或在 `generateMonthlySummaryPdfs` 設中斷點確認沒有被呼叫。

24. **學員**（`Trainee.socialId` 有對應、`Coach` 沒有）在一對一聊天傳「產生報表」：收到「此功能僅限教練使用」。
25. **未註冊的 LINE 使用者**（Coach / Trainee 都沒有）在一對一聊天傳送：同第 24 項。
26. **軟刪除的教練**（`deletedDate` 不為 NULL）在一對一聊天傳送：同第 24 項。
27. **教練在群組中**傳送（`source.type === "group"`）：收到「請於一對一聊天中使用此功能」，沒有產生報表。
28. **教練在多人聊天室中**傳送（`source.type === "room"`）：同第 27 項。
29. **學員在群組中**傳送：同第 27 項（來源類型檢查優先於身分檢查）。
30. 以 code review 確認：`userId` 為 `undefined`、`""`、空白或格式不符 `/^U[0-9a-f]{32}$/` 時，在呼叫 `getBySocialId` **之前**就被擋下（LINE 無法直接模擬這些情況）。
31. **教練在一對一聊天**：見第 44 項（會上傳 Blob，需測試用 Blob token）。

### 9.5 月報 PDF「個人計畫簽到統計」（任務 7 完成後）

前置：`getMonthlySummary` 只查**上個月**，所以要在本地 DB 準備上個月的虛構 `TrainingRecord`（例如把測試資料的 `createdDate` 設為上個月），涵蓋至少兩位教練與 PrivateTraining / FlexPrivate / SemiPrivate。以 `GET /monthlySummary/privateTraining` 下載 PDF 檢查。

32. **混合資料**：同一份報表中包含：
    - 空備註：備註欄為**空白**，不是「—」；其他欄位的空值仍顯示「—」。
    - 100 字中文、沒有換行：在備註欄內完整折行顯示（未被截斷），列高增加，不與相鄰列或欄位重疊。
    - 多行（數個 `\n`，含連續空白行與只有空白 / `\t` 的行）：PDF 中換行變成空白，連續空白合併為一個，不分行。
    - 含 `\t`：顯示為空白，沒有方框。
    - 100 字無空白的英數字串或 URL：在欄寬內斷行，不超出欄位。
    - 含 U+2A736：正確顯示（若字型沒有該字形，記錄為字型限制，但不可造成錯誤或截斷位置錯誤）。
33. **大量換行**：備註為 50 個以上換行（每行 1 字）：PDF 中換行變成空白，完整顯示，約 2 行，不出現「…」。
34. **只有空白的行**：備註為 `a`、空白行、只有 `\t` 的行、只有空白的行、`b` 交錯組成：PDF 顯示為 `a b`。
35. **合併列含兩段多行備註**：同一學員、同一教練、同一方案類型、同一額度，上個月有兩個計畫，各有多行備註：
    - 仍為一列，兩段備註各以「• 」開頭，**依計畫 id（建立順序）排列**，不依內容排序。
    - 兩段各 100 字時完整顯示，不截斷、不出現「…」。
    - 兩者備註相同：只出現一次，且不加「• 」。
    - 一個有備註、一個空：只顯示有內容的那段，不加「• 」。
    - 每個計畫有多筆簽到：備註不會因 join 而重複出現。
36. **換頁**：準備足夠列數（例如單一教練 30 位學員以上，部分附長備註），讓表格跨頁：
    - 換頁發生在列與列之間，沒有任何一列被切開。
    - 新頁的頁首與表頭有重畫。
    - 頁尾的頁碼與產出時間沒有與內容重疊。
    - 小計條位置正常。
    - 在頁面底部附近放一列 100 字的備註：整列移到下一頁。
37. **沒有任何備註的月份**：備註欄全為空白，版面整齊；與修改前相比，只有「簽到日期」欄變窄、折行變多。
38. **簽到日期很多**：某學員一個月 20 次以上簽到，「簽到日期」欄折行正常，列高合理。
39. **同名分組（決策 B）**：
    - 同一教練底下有兩位**同名**的不同學員：拆成兩列，各自的次數、簽到日期、備註正確，順序固定（依 `trainee.id`）。
    - 名字都不同的一般資料：列數與修改前相同。
    - 兩位**同名**的不同教練：查詢結果拆成不同列，順序固定（依 `coach.id`），但 PDF 仍依 `coachName` 合併在同一個教練頁（既有邏輯，已知限制）。
40. **迴歸**：月報總覽頁（`drawPrivateOverview`）與「團體課程簽到統計」PDF（`GET /monthlySummary/groupFitness`）的版面與修改前相同，不含備註。
41. **重新產生使用當下備註**：修改某計畫備註後再次下載，PDF 顯示新的備註。

### 9.6 UI（任務 9–11 完成後）

42. **表單與資料流**：
    - 既有計畫（無備註）：卡片仍顯示「備註」標題、內容留白；點「編輯」，表單備註為空。
    - 新增 PrivateTraining 計畫並填多行備註，卡片顯示且保留換行。
    - 編輯：表單帶出原備註；更新後卡片顯示新內容；其他欄位不變；編輯者更新為目前教練（既有行為）。
    - 清除或只輸入空白 / 換行：卡片仍顯示「備註」標題、內容留白。
    - 每項操作後**硬重新整理**（hard reload），結果與儲存一致。
    - textarea 下方不顯示提示文字。
    - textarea 的 `maxlength` 讓使用者無法輸入或貼上超過 100 字（貼上時會被截斷），字數顯示 `100/100`。正常操作下不會出現錯誤訊息。
    - 防禦性檢查：用 DevTools 移除 `maxlength` 後輸入 101 字，即時顯示「備註不能超過100字」，且無法送出。
    - 讓後端回錯誤（例如停掉後端）後送出：顯示錯誤訊息，表單中的備註仍在。
    - 含 U+200B 等隱形字元的文字（例如用 DevTools console 設定 textarea 的值）送出：後端回 400，前端顯示錯誤訊息，輸入保留。
    - GroupFitness（無教練）、FlexPrivate（無時段）、SemiPrivate 新增與編輯備註，既有驗證規則不受影響。
    - 「取消」後表單備註清空。
    - 編輯 A（修改備註未送出）時直接點 B 的「編輯」：表單完全換成 B 的資料；送出後只有 B 被更新。
43. **卡片版面與安全**：
    - 100 字無空白長字串與長 URL：在手機寬度（DevTools 375px）與桌面三欄 grid 下，卡片與 grid 欄不被撐寬、不出現水平捲軸。
    - 約 50 個換行：備註區塊高度被限制在 `max-h-24`，可在區塊內捲動。
    - XSS：`<script>alert(1)</script>`、`<b>x</b>` 以純文字顯示。
    - 學員身分從 LINE 開啟學員資訊：`TraineePlanList` 不顯示備註。
    - CoachInfo 學員列表、簽到紀錄下拉選單、前端 jsPDF 匯出（不含備註）正常。

### 9.7 整合（需測試用 Blob token 與 LINE channel，經使用者確認後執行）

44. **教練**（`Coach.socialId` 為測試教練的 LINE ID）在**一對一聊天**傳「產生報表」：收到含下載連結的 flex 訊息；下載的 PDF 含從 UI 編輯的備註。
    - 測試後**刪除**本次上傳到測試 Blob store 的 PDF（Vercel Blob dashboard，或以測試 token 呼叫 `del`）。
    - 若使用者未提供測試用 Blob token，此項改由使用者在部署後自行確認。

## 10. 風險

| 風險 | 影響 | 緩解 |
|---|---|---|
| **API 沒有任何驗證 / 授權**（既有狀況） | 任何知道 API URL 的人都能讀取及修改備註。學員端 UI 隱藏只是外觀上的處理 | 不在本計畫範圍，列為第 13 節後續待辦。**告知教練：備註不可寫入敏感資料**。 |
| **備註隨月報 PDF 經 LINE 與 Blob 散布**（本功能新增） | PDF 以 `access: "public"`、固定檔名上傳 Blob，持有 URL 即可下載。仍可取得的途徑：`GET /regenerateReport`（回傳 URL）、`GET /monthlySummary/privateTraining`（直接下載）、`GET /cron/monthlySummary`（任何人可觸發）、`api/blobs.js`（無驗證列出 PDF）、LINE 訊息轉傳 | 「產生報表」已限教練、限一對一聊天（4.6）；其餘列為第 13 節後續待辦。部署前通知，**提醒教練不可寫入醫療或敏感資料**（表單不顯示提示，使用者決定）。 |
| 「產生報表」權限可被繞過 | `PATCH /coach/:id` 無驗證，可把教練的 `socialId` 改為任意 LINE ID | 屬第 13 節授權專案；本計畫只做降低風險的處理。 |
| `Coach.socialId` 寫死的預設 LINE ID | 未指定 `socialId` 而建立的教練資料會對應到該帳號，該帳號因此可使用「產生報表」 | 第 8 節部署前檢查；修正 entity default 列入第 13 節。 |
| 教練 `socialId` 未綁定 | 教練傳「產生報表」被拒絕 | 第 8 節部署前檢查。 |
| 誤動 LINE_BOT 未 commit 的使用者變更，或外洩其內容 | 使用者工作遺失、機密外洩 | 只修改第 6 節列出的檔案；禁止 `npm run lint` / `format` 與全域 git 指令；受保護檔案只做雜湊比對，不 diff、不讀取。 |
| 本地測試誤觸正式 DB / Blob / LINE，或使用真實資料 | 正式資料被變更、正式月報被覆蓋、訊息傳給真實收件人、個資外洩 | 5.1：使用者確認 DB、LINE token、Blob token 都不是正式環境，且 DB 只有虛構資料；`inet_server_addr()` / `current_database()` 唯讀檢查；第 6 節限制本地測試的 endpoint；測試上傳的 PDF 事後刪除。 |
| `note: null`、非字串、控制 / 格式 / surrogate / 私人使用 / 未指派字元 | 500 錯誤，或在 PDF 中隱藏 / 倒置文字 | 4.3 的 `Transform` + `ValidateIf` + `IsString` + Unicode property `Matches`，以 9.1 驗證。 |
| 簽到時覆蓋同時被編輯的計畫欄位（lost update） | 教練剛寫的備註或額度被舊值蓋掉 | 4.4：只 `update` 變更的單一欄位，以 9.3 驗證。 |
| 簽到分支使用載入時的 `quota`（既有行為，**已知限制**） | 若教練在簽到流程進行中修改額度，可能走錯分支，更新到錯誤的 `start` / `end` | 本功能之前就存在，只記錄，不修改。 |
| PDF 單列超過一頁 | 內容溢出頁面、與頁尾重疊 | 4.5：換行改成空白、輸入上限 100 字，單一備註約 10 行；合併 4 個以上計畫才可能接近一頁（接受此風險）。以 9.5 第 33–36 項驗證。 |
| PDF 備註不分行 | PDF 中換行變成空白，多行備註在月報中會連成一段 | 使用者決定；完整格式可在管理頁面查看。 |
| PDF 同名教練合併、學員數以名字計算（既有邏輯，**已知限制**） | 同名的兩位教練會出現在同一頁；同名學員在小計中只算一位 | 範圍外，只記錄。 |
| PDF 不支援 emoji | emoji 顯示為空白或方框 | 已知限制，不處理。 |
| 部署順序錯誤（前端先上） | 備註靜默未儲存，使用者以為已存 | 嚴格依第 8 節順序部署。 |
| migration 未執行就上新後端 | 所有讀取計畫的 API 與月報出錯 | migration 列為部署第一步，並以 `typeorm:show` 確認。 |
| Rollback 期間的快取前端與已上傳的 PDF | 備註修改被靜默丟棄；含備註的 PDF 仍在 Blob 上 | 依第 8 節順序回退；重新產生或刪除受影響的 PDF。 |
| 前端 build 不做型別檢查 | 型別錯誤可能未被發現 | IDE 檢查、code review，可選 `npx tsc --noEmit`；不新增依賴。 |
| 無自動化測試 | 迴歸只能靠手動 | 依第 9 節完整手動測試，並執行 build 與針對性 eslint。 |

## 11. 實作任務（依序，每步可獨立驗證）

以下 `<scratch>` 指 session scratchpad，或其他**兩個專案目錄以外**的暫存位置。目標檔案（`<targets>`）為：
`src/entities/training-plan.entity.ts src/dto/training-plan.dto.ts src/services/data.service.ts src/services/line.service.ts src/services/pdf.service.ts`

0. [後端] **Snapshot（動工前）**，在 `/Users/wayne/Github/LINE_BOT` 以 `set -euo pipefail` 執行，任何指令失敗即停止：
   - `git status --porcelain -uall > <scratch>/linebot-status-before.txt`
   - 確認 `scripts/` 內檔案清單非空：`find scripts -type f | wc -l` 必須大於 0（若為 0 或目錄不存在，停止並回報）。
   - `{ shasum -a 256 .env .gitignore README.md database/migrations/1761836394915-GenerateTables.ts database/ormconfig.ts src/app.module.ts docker-compose.yml; find scripts -type f -print0 | sort -z | xargs -0 shasum -a 256; } > <scratch>/linebot-protected-before.sha256`：只記錄雜湊，不讀取、不保存內容。確認 exit code 為 0（任何檔案不存在都會失敗），且輸出行數等於 7 加上 `scripts/` 的檔案數。
   - `git diff -- <targets>`：應為空。若這些目標檔案已有使用者的未 commit 變更，**停止並詢問使用者**。
1. [後端] 依 5.1 **由使用者確認 DB（含 DB 名稱、只有虛構資料）、LINE token、Blob token**，並執行唯讀連線檢查。計算 timestamp `Math.max(Date.now(), maxExisting + 1)` 並確認大於 `1785680974622`，新增 migration 檔。依序執行 `typeorm:show`（只有這一筆）、`typeorm:run`、成功後 `typeorm:revert`、再 `typeorm:run`（每次 run / revert 前都重做連線檢查）。
2. [後端] entity 加 `note`，`npm run build`，啟動後確認 `GET` 學員資料回傳含 `note: ""`。
3. [後端] DTO 加 `note` 正規化與驗證（4.3），執行 9.1。
4. [後端] `createTrainingPlan` / `updateTrainingPlan` 寫入 `note`，執行 9.2。
5. [後端] `line.service.ts:784-789` 改為只 `update` 變更的欄位（4.4，先再確認一次），`npm run build`，執行 9.3。
6. [後端] 「產生報表」限教練、限一對一聊天（4.6），`npm run build`，執行 9.4 第 24–30 項。
7. [後端] 月報：`getMonthlySummary` 加 id 分組、排序與 `JSONB_AGG` 備註彙總（4.5 查詢）；`pdf.service.ts` 加 `notes`、`emptyText`、每段前處理、去重與前綴、調整欄寬（4.5 版面）。`npm run build`，執行 9.5。
8. [後端] **Snapshot（完成後）**，同樣以 `set -euo pipefail` 執行：
   - 再次產生 `git status --porcelain -uall` 與受保護檔案的 `shasum -a 256`（同樣檢查 exit code 與行數），分別與任務 0 比對。受保護檔案的雜湊必須**完全相同**；status 只能多出 5 個目標檔案與 1 個新 migration 檔。
   - `git diff` **只**對 `<targets>` 執行，新 migration 檔直接檢視內容。
   - 確認修改的檔案中沒有實際的不可見字元（例如以 `rg -n '[\p{Cf}\p{Co}]'` 檢查 `<targets>` 與新 migration 檔，應無結果）。
   - 若有任何非預期差異，立即停止並回報。
   - 對 `<targets>` 與新 migration 檔執行不帶 `--fix` 的 `npx eslint`。
9. [前端] `training-plan.ts` 型別。
10. [前端] `TrainingPlan.vue` 表單、即時驗證、送出（trim）、重置、載入，`npm run build`。
11. [前端] `TrainingPlanList.vue`：卡片 `min-w-0` 與唯讀顯示，`npm run build`；可選 `npx tsc --noEmit`。
12. [整合] 執行 9.6；經使用者確認測試用 Blob / LINE 後執行 9.7。
13. [收尾] 使用者驗收完成後：
    - **刪除** `<scratch>` 中的 snapshot 檔（`linebot-status-before.txt`、`linebot-protected-before.sha256` 及任務 8 產生的比對檔）。
    - **刪除**測試期間上傳到測試 Blob store 的所有 PDF（若有）。
    - 下載到本機檢查用的 PDF 一併刪除。

## 12. 已確認決策

- **Q1 長度上限**：**100 字**。前端 `maxlength`、前端驗證、後端 `@MaxLength` 三處同步。DB 欄位不限長度，日後調整上限不需 migration。
- **Q2 學員是否看得到備註**：**看不到**。不修改 `TraineePlanList.vue`，只在 UI 層隱藏。API 仍會把 `note` 回傳到學員端；要真正保護需要建立驗證 / 授權架構（第 13 節）。
- **Q3 PDF 是否包含備註**：**後端**月報「個人計畫簽到統計」**包含**（4.5）；**前端** `TrainingRecordList.vue` jsPDF 匯出**不包含**。
- **A「產生報表」限教練**：只允許一對一聊天（`source.type === "user"`）；`userId` 須符合 `/^U[0-9a-f]{32}$/`；以 `Coach.socialId` 比對，排除軟刪除教練。群組 / 聊天室回覆「請於一對一聊天中使用此功能」，非教練回覆「此功能僅限教練使用」（4.6）。
- **B 月報分組**：`GROUP BY` 加入 `trainee.id` 與 `coach.id`，排序加入 `coach.id`、`trainee.id`（4.5）。

本計畫目前沒有其他待確認事項。

## 13. 後續待辦（不在本計畫範圍，另立專案）

**API / LINE 指令 / Blob 缺乏驗證與授權**（使用者已決定先記錄，之後另立專案處理）。

- **本計畫已處理**：LINE 文字指令「產生報表」限教練、限一對一聊天（4.6）。此項仍依賴 `Coach.socialId` 不被竄改，完整防護需搭配下列 API 授權。
- **尚未處理**：
  - LINE_BOT 所有 HTTP endpoint 都沒有 guard（無 `UseGuards` / `APP_GUARD`），包括讀寫學員、教練（`PATCH /coach/:id` 可修改 `socialId`）、計畫、簽到紀錄。
  - `coach.entity.ts:23` 的 `socialId` default 為**寫死的預設 LINE ID**，應改為空字串或移除 default（需 migration 修改欄位 default，並處理既有資料）。
  - `GET /monthlySummary/privateTraining`、`GET /monthlySummary/groupFitness` 可直接下載月報。
  - `GET /cron/monthlySummary` 沒有 cron secret 保護，任何人都能觸發產生、上傳與 LINE push。
  - `GET /regenerateReport` 無驗證，並在回應中回傳 Blob URL。
  - 月報以 `access: "public"`、固定檔名（無隨機後綴）上傳 Vercel Blob，URL 可推測，持有即可下載。
  - `Managment_Web/api/blobs.js` 無驗證即可列出及刪除所有 Blob，且 CORS 為 `*`。
  - `editor` 由前端在 request body 中自行提供（`TrainingPlanDto.editor`），可被偽造成任何教練。
- **影響**：學員個資、訓練紀錄、計畫備註與月報實際上都可被外部取得或修改。
- **後續專案需規劃**：
  - API 驗證機制（例如 LINE Login / LIFF ID token 驗證）與教練 / 學員角色授權。
  - `editor` 改由後端依登入身分決定。
  - 修正 `Coach.socialId` 的 entity default。
  - cron endpoint 以 secret header 保護。
  - `regenerateReport` 與月報下載 endpoint 限教練使用。
  - Blob 改為非公開或限時簽章連結，或至少加上隨機後綴。
  - `api/blobs.js` 加上驗證並限制 CORS。
  - 評估 API 依角色過濾備註。
- 這屬於**架構變更**，需由使用者另行決定範圍與優先順序。
