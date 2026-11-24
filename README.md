# Managment_Web

學員與教練管理後台（前端），負責學員／教練資料、訓練計畫、簽到紀錄與團體課程的介面。部署在 Vercel，資料由後端 [`LINE_BOT`](../LINE_BOT/README.md) 提供。

## 技術架構

- **框架**：Vue 3（`<script setup>`）+ Vite 8
- **路由 / 狀態**：vue-router 5、Pinia 3
- **UI**：Element Plus、daisyUI 5 + Tailwind CSS 4
- **HTTP**：axios
- **PDF**：jsPDF + jspdf-autotable（前端簽到紀錄匯出）
- **其他**：dayjs、`@vercel/blob`（dev server 使用）
- **部署**：Vercel（`vercel.json`），`api/blobs.js` 為 Vercel Function

## 目錄結構

```
src/
├── components/   # 共用與列表元件（TrainingPlanList、TraineeForm、TrainingRecordList…）
├── views/        # 頁面（TrainingPlan、TraineeInfo、CoachManage、LineCallback…）
├── services/     # API 呼叫（api.ts、training-plan.ts、line-login.ts…）
├── stores/       # Pinia store（trainee、coach、viewer、navigation）
├── router/       # 路由
└── utils/        # 工具（PDF 字型、下拉選單…）
api/              # Vercel Function（blobs.js）
vite.config.ts    # Vite 設定（含 dev server 用的 Blob 路由）
vercel.json
```

---

## 本機開發

完整說明（Docker 資料庫、同步正式資料、Adminer、LINE 設定、疑難排解）見 **[`LINE_BOT/README.md`](../LINE_BOT/README.md)**。

前端只需要：

```bash
# .env.development.local（不進 git，只在 npm run dev 時生效）
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev    # http://localhost:5173
```

不要把 `VITE_API_URL` 放進 `.env.local`：Vite 在 `npm run build` 也會讀它，會把 localhost 寫死進正式打包檔。

---

## 環境變數

只列名稱與用途，實際值請放在 `.env*` 檔案中，**不要提交到 git**。

| 變數 | 用途 |
|---|---|
| `VITE_API_URL` | 後端 API 的基底 URL（`src/services/api.ts`、`src/views/CoachManage.vue`） |
| `VITE_LINE_LOGIN_CHANNEL_ID` | LINE Login channel ID（`src/services/line-login.ts`） |
| `BLOB_READ_WRITE_TOKEN` | 僅 dev server（`vite.config.ts`）使用的 Vercel Blob token |
| `VITE_BLOB_READ_WRITE_TOKEN` | 同上，`BLOB_READ_WRITE_TOKEN` 未設定時的備用名稱（`vite.config.ts`） |

- **`VITE_LINE_CHANNEL_SECRET` 已移除，不得設定**（Vercel 所有環境也要刪除）。`VITE_*` 會被打包進前端，secret 只能放在後端。LINE Login 的 token 交換改由後端 `POST /auth/line-login` 處理。
- LINE 相關的本機值放在 `.env.development.local`；LINE 變數的完整說明見 [`LINE_BOT/README.md`](../LINE_BOT/README.md)。

---

## 常用指令

| 指令 | 說明 |
|---|---|
| `npm run dev` | 啟動 Vite dev server（預設 http://localhost:5173） |
| `npm run build` | `vite build`（不做 TypeScript 型別檢查） |
| `npm run preview` | 預覽打包結果 |

目前沒有 lint 與測試指令。

---

## 主要功能

- **學員 / 教練管理**：學員與教練列表、詳細資料與表單。
- **LINE 登入與教練綁定**：透過 LINE Login 登入（`/line-callback`），並綁定教練帳號。登入以一次性的隨機 `state` / `nonce` 驗證，授權碼交由後端 `POST /auth/line-login` 換取身分。
- **訓練計畫**（`TrainingPlan.vue`）：新增、編輯計畫（方案類型、額度、訓練時段）。
- **簽到紀錄**（`TrainingRecordList.vue`）：列表與下拉選單，可前端匯出 PDF。
- **團體課程**：開課課程表單與週檢視（`OpeningCourse.vue`）。

### 訓練計畫備註（`note`）

- 在計畫編輯表單填寫**備註**，新增與編輯皆可，最多 **100 字**，輸入框即時顯示字數。清空備註即可移除內容。
- 歷史訓練計畫的每張卡片都會顯示「備註」區塊；沒有內容時留白。內容保留換行，以純文字顯示。
- **學員端不顯示備註**。
- 備註會加入後端月報「個人計畫簽到統計」PDF（由 `LINE_BOT` 產生）；**前端簽到紀錄的 PDF 匯出不含備註**。
- 備註只會顯示與編輯，**請勿填寫醫療或敏感個人資料**。

---

## 部署

- 部署平台為 **Vercel**，建置指令為 `npm run build`（`vite build`）。
- 部署順序：**migration → 後端（LINE_BOT）→ 前端（本 repo）**。前端最後部署，詳見 [`LINE_BOT/README.md`](../LINE_BOT/README.md) 的「資料庫 Migration 與部署」。
- 若先部署前端，備註會因後端尚未支援而無法儲存。
- LINE 登入與 Webhook 相關的部署順序（含 `VITE_LINE_CHANNEL_SECRET` 移除與 LINE Login secret 輪替）見 [`LINE_BOT/README.md`](../LINE_BOT/README.md) 的「LINE 登入與 Webhook 部署」。

## 相關專案

- 後端 / LINE Bot：[`LINE_BOT`](../LINE_BOT/README.md)
