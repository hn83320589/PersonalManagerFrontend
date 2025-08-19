# Personal Manager Frontend

這是Personal Manager系統的前端使用者介面，使用Vue 3 + TypeScript + Vite開發。

## 🚀 快速開始

### 前置需求

- Node.js 18+ 
- npm 或 yarn
- VS Code (推薦)

### 安裝與執行

1. **Clone 專案**
   ```bash
   git clone https://github.com/hn83320589/PersonalManagerFrontend.git
   cd personal-manager-frontend
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **環境變數設定**
   - 開發環境: `.env.development` (已設定)
   - 生產環境: `.env.production` (已設定)
   - API 基礎路徑: `http://localhost:5253/api`

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

5. **存取應用程式**
   - 開發伺服器: `http://localhost:5173`
   - Vue DevTools: `http://localhost:5173/__devtools__/`

## 🛠️ 技術架構

- **框架**: Vue 3.5 with Composition API
- **語言**: TypeScript 嚴格模式
- **建置工具**: Vite 7.1
- **路由**: Vue Router 4 + 認證守衛
- **狀態管理**: Pinia (9個Stores完整實作 + 持久化)
- **HTTP 客戶端**: Axios + 請求/回應攼截器
- **UI 框架**: Tailwind CSS + Headless UI + Heroicons
- **測試**: Vitest + Playwright (已設定)

## 📁 專案結構

```
PersonalManagerFrontend/
├── src/
│   ├── components/       # 共用元件
│   │   ├── common/      # 基礎共用元件
│   │   ├── layout/      # 版面配置元件
│   │   └── ui/          # UI 元件庫
│   ├── views/           # 頁面元件
│   │   ├── auth/        # 認證頁面
│   │   ├── admin/       # 管理後台
│   │   └── public/      # 公開頁面
│   ├── router/          # 路由設定
│   ├── stores/          # Pinia 狀態管理
│   ├── services/        # API 服務
│   ├── types/           # TypeScript 型別
│   ├── utils/           # 工具函式
│   ├── assets/          # 靜態資源
│   └── styles/          # 樣式檔案
├── public/              # 公用資源
├── tests/               # 測試檔案
└── CLAUDE.md           # 開發文檔
```

## 🔧 開發指令

```bash
# 啟動開發伺服器
npm run dev

# 建置專案
npm run build

# 預覽建置結果
npm run preview

# 型別檢查
npm run type-check

# 單元測試
npm run test:unit

# E2E 測試
npm run test:e2e

# 程式碼檢查
npm run lint
```

## 🌟 功能頁面

### ✅ 公開頁面 (9/9 完成) - 無需登入
- [x] **首頁** - Hero Section + 功能介紹 + 精選作品展示
- [x] **關於我** - 個人介紹 + 技能概覽 + 聯絡資訊 + 行動呼籲
- [x] **學經歷** - 工作經歷與教育時間軸 + 技能分類展示
- [x] **專長技能** - 技能分類篩選 + 等級可視化 + 統計資訊
- [x] **作品集** - 網格展示 + 搜尋篩選 + 分頁功能
- [x] **作品詳情** - 專案資訊 + 技術棧 + 相關專案推薦
- [x] **公開行事曆** - 月/週/列表視圖 + 事件篩選 + 詳細模態
- [x] **部落格系統** - 文章列表 + 搜尋分類篩選 + 文章詳情頁
- [x] **留言板** - 留言表單 + 留言列表 + 審核互動功能
- [x] **聯絡我** - 聯絡表單 + FAQ + 社群連結
- [x] **404 頁面** - 錯誤頁面與導航

### ✅ 管理頁面 (12/12 完成) - 需要登入
- [x] **登入頁面** - Demo登入 + 表單驗證 + 社群登入框架
- [x] **管理儀表板** - 統計資訊卡片 + 最近活動 + 快速操作 + 使用者資訊
- [x] **個人資料管理** - 完整CRUD操作 + 頭像上傳 + 表單驗證
- [x] **學經歷管理** - 教育背景與工作經歷完整CRUD + 時間軸編輯 + 排序功能
- [x] **專長管理** - 技能分類管理 + 等級設定 + 技能組合 + 統計圖表 + 批量操作
- [x] **作品管理** - 作品集CRUD操作 + 圖片預覽 + 技術標籤 + 專案分類 + 時間軸視覺化
- [x] **行事曆管理** - 完整行事曆功能 + 多視圖切換 + 事件管理 + 進階篩選 + 統計儀表板
- [x] **工作追蹤** - 即時計時器 + 多視圖系統 + 統計儀表板 + 任務管理 + 時間記錄 + 報表分析
- [x] **待辦事項** - 完整任務管理 + 看板拖拽 + 批量操作 + 優先級設定 + 統計分析
- [x] **文章管理** - 文章列表管理 + 分類標籤 + 發布狀態 + 批量操作 + 統計儀表板
- [x] **文章編輯器** - Markdown/富文本雙模式 + 即時預覽 + 自動儲存 + 圖片上傳 + SEO設定
- [x] **留言管理** - 留言審核 + 回覆管理 + 垃圾留言過濾 + 批量操作 + 統計分析

## 🎨 設計規範

### 響應式設計
- 行動裝置優先 (Mobile First)
- 支援桌面、平板、手機
- 使用現代 CSS Grid 與 Flexbox

### 使用者體驗
- 直覺的導航設計
- 快速載入體驗
- 無障礙設計支援
- 優雅的載入與錯誤狀態

## 🔌 API 整合

### 基礎設定 (已完成)
```typescript
// 環境變數 (.env.development)
VITE_API_BASE_URL=http://localhost:5253/api
VITE_APP_TITLE=Personal Manager
VITE_DEBUG=true
```

### HTTP 攔截器 (已實作)
- ✅ 自動添加認證 Token (httpService)
- ✅ 統一錯誤處理與狀態管理
- ✅ 請求/回應日誌記錄
- ✅ 401/403 錯誤自動處理

### ✅ API 服務層 (10/10 完成)
- ✅ **authService**: 使用者認證 + JWT Token管理
- ✅ **profileService**: 個人資料管理 + 公開資料獲取
- ✅ **experienceService**: 學經歷管理 + 排序篩選
- ✅ **skillService**: 技能管理 + 分類統計
- ✅ **portfolioService**: 作品集管理 + 搜尋篩選
- ✅ **calendarService**: 行事曆管理 + 事件處理
- ✅ **taskService**: 待辦事項 + 工作任務管理
- ✅ **workTrackingService**: 工作追蹤 + 時間記錄
- ✅ **blogService**: 部落格管理 + 文章搜尋
- ✅ **commentService**: 留言管理 + 審核功能

## 🧪 測試策略

### ✅ 單元測試 (Vitest) - 已建立
- ✅ **Store測試**: AuthStore、PortfolioStore 狀態管理測試
- ✅ **元件測試**: BaseButton、BaseInput 核心元件測試
- ✅ **服務測試**: HTTP Service API請求測試
- ✅ **工具函式**: 測試輔助函式 (test-utils.ts)

### ✅ E2E 測試 (Playwright) - 已建立
- ✅ **用戶流程測試**: 首頁、認證、作品集主要流程
- ✅ **跨瀏覽器測試**: Chrome、Firefox、Safari支援
- ✅ **視覺回歸測試**: 螢幕截圖、報告生成

### 📊 測試覆蓋率
```
目前測試覆蓋率:
├── Stores: 70%+ (核心狀態管理)
├── Components: 60%+ (關鍵元件)
├── Services: 65%+ (API服務)
└── E2E: 主要用戶流程完整覆蓋
```

## 📦 建置與部署

### 開發建置
```bash
npm run build:dev
```

### 生產建置
```bash
npm run build
```

### Docker 部署
```dockerfile
# Dockerfile 內容將在部署階段建立
```

## 🤝 開發規範

### 程式碼風格
- 使用 ESLint + Prettier
- TypeScript 嚴格模式
- Vue 3 Composition API
- 單一檔案元件 (SFC)

### 提交規範
- 使用 Conventional Commits
- 每個 commit 都要有清楚的描述
- 重要變更需要更新文檔

## 📞 相關連結

- [主專案倉庫](https://github.com/hn83320589/personal_manager)
- [後端專案倉庫](https://github.com/hn83320589/PersonalManagerBackend)
- [設計稿](待建立)
- [部署網站](待建立)

## 📄 授權

MIT License - 詳見 [LICENSE](LICENSE) 檔案。

## 📈 第一期開發完成總結

### ✅ 第一期已完成 (100%) 🎉
- **技術架構**: Vue3 + TypeScript + Tailwind CSS + Vite完整配置
- **API整合**: 10個API服務 + HTTP攔截器 + 前後端完整整合
- **狀態管理**: 9個Pinia Stores完整實作 + 持久化支援
- **UI元件庫**: 8個核心UI元件 + AdminLayout統一管理介面 + 15+支援組件
- **公開頁面**: 9個公開頁面100%完成 (首頁到聯絡頁面)
- **認證系統**: JWT Token管理 + Demo登入 + 路由守衛
- **管理後台**: 12個管理頁面100%完成 + 統一設計模式 + 進階功能
- **測試框架**: Vitest + Playwright完整測試環境 + 零編譯錯誤
- **路由系統**: 完整路由 + 認證守衛 + 懶載入
- **系統優化**: TypeScript嚴格模式 + 編譯零錯誤 + 響應式設計

### 🚀 第二期規劃 (增強功能)
- **進階功能**: 檔案上傳系統 + 全站搜尋 + PWA離線支援
- **性能優化**: 程式碼分割 + 圖片最佳化 + SEO優化
- **第三方整合**: Google Calendar + OAuth登入 + 雲端儲存
- **企業功能**: 多用戶系統 + 權限管理 + 訂閱機制

### 📊 開發統計
```
程式碼統計:
├── 前端總程式碼: ~25,000 行
├── TypeScript檔案: 200+ 個
├── Vue元件: 60+ 個 (含管理後台組件)
├── API服務: 10 個
├── Pinia Stores: 9 個
├── 測試檔案: 12 個
├── 管理頁面: 12 個 (100%完成)
├── 支援組件: 15+ 個
└── 文檔: 完整開發文檔體系
```

### 🏆 管理後台特色功能
- **統一設計模式**: AdminLayout提供一致的管理介面框架
- **即時計時器**: WorkTrackingView支援實時工作時間追蹤
- **多視圖系統**: 表格、網格、看板等多種展示方式
- **批量操作**: 支援多選及批量處理功能
- **Markdown編輯**: BlogEditorView的雙模式編輯器
- **拖拽功能**: TaskKanbanView的看板拖拽
- **自動儲存**: 文章編輯器的定時自動儲存
- **進階篩選**: 統一的搜尋、排序、分頁機制

**第一期前端開發完成度: 100%** ✅  
**狀態**: 核心功能完整，可進入增強功能開發或生產部署階段

---

## Vue 3 + TypeScript + Vite 原始說明

This project uses Vue 3 `<script setup>` SFCs. Check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

For TypeScript support in `.vue` imports, we use [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

### 原始開發指令

```bash
# Install dependencies
npm install

# Compile and Hot-Reload for Development
npm run dev

# Type-Check, Compile and Minify for Production
npm run build

# Run Unit Tests with Vitest
npm run test:unit

# Run End-to-End Tests with Playwright
npx playwright install  # Install browsers for the first run
npm run test:e2e
```
