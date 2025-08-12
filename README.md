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
   - API 基礎路徑: `http://localhost:5002/api`

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
- **狀態管理**: Pinia (authStore + portfolioStore 已實作)
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

### 公開頁面 (無需登入)
- [x] 首頁 - 完整 Hero Section + 功能介紹 + 精選作品
- [ ] 關於我 - 詳細個人介紹
- [ ] 學經歷 - 教育背景與工作經歷
- [ ] 專長技能 - 技能展示
- [x] 作品集 - 專案作品展示 (搜尋 + 篩選 + 分頁)
- [ ] 公開行事曆 - 公開的行程安排
- [ ] 部落格 - 公開文章列表與內容
- [ ] 留言板 - 訪客留言功能
- [ ] 聯絡我 - 聯絡資訊與表單
- [x] 404 頁面 - 錯誤頁面與導航

### 管理頁面 (需要登入) - 設定中
- [ ] 登入頁面 - 使用者登入 (路由已設定)
- [ ] 管理儀表板 - 個人管理總覽
- [ ] 個人資料管理 - 編輯個人資訊
- [ ] 學經歷管理 - 新增/編輯學經歷
- [ ] 專長管理 - 管理技能資料
- [ ] 作品管理 - 管理專案作品
- [ ] 行事曆管理 - 完整行事曆功能
- [ ] 工作追蹤 - 工作進度追蹤
- [ ] 待辦事項 - 個人任務管理
- [ ] 文章管理 - 撰寫/編輯部落格文章
- [ ] 留言管理 - 管理訪客留言

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
VITE_API_BASE_URL=http://localhost:5002/api
VITE_APP_TITLE=Personal Manager
VITE_DEBUG=true
```

### HTTP 攔截器 (已實作)
- ✅ 自動添加認證 Token (httpService)
- ✅ 統一錯誤處理與狀態管理
- ✅ 請求/回應日誌記錄
- ✅ 401/403 錯誤自動處理

### API 服務層 (已完成)
- ✅ authService: 使用者認證
- ✅ profileService: 個人資料管理  
- ✅ portfolioService: 作品集管理
- 🔄 其他服務層開發中

## 🧪 測試策略

### 單元測試 (Vitest)
- 元件測試
- 工具函式測試
- Store 狀態測試

### E2E 測試 (Playwright)
- 使用者流程測試
- 跨瀏覽器測試
- 視覺回歸測試

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

## 📈 開發進度總結

### ✅ 已完成 (約 40-50%)
- **技術架構**: Tailwind CSS + TypeScript + 環境變數管理
- **API 服務**: HTTP 攔截器 + 3個主要服務 (auth, profile, portfolio)
- **狀態管理**: Pinia stores (authStore + portfolioStore)
- **UI 元件**: 5個基礎元件 (Button, Input, Spinner, Header, Footer)
- **頁面開發**: 首頁 + 作品集列表 + 404頁面
- **路由系統**: 完整路由 + 認證守衛 + 動態載入

### 🔄 進行中
- 其他 API 服務層開發
- 更多頁面元件開發
- 前後端 API 整合測試

### ⏳ 待開發
- 管理後台頁面
- 表單驗證與提交
- 單元測試與 E2E 測試
- 效能優化與 SEO

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
