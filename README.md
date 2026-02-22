# Personal Manager Frontend

個人展示與管理平台前端 UI，使用 Vue 3 + TypeScript + Vite 開發。

## 技術棧與套件

### 核心

| 套件 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.18 | UI 框架 |
| Vue Router | 4.5.1 | 路由管理 |
| Pinia | 3.0.3 | 狀態管理 |
| pinia-plugin-persistedstate | 4.5.0 | Store 持久化（localStorage） |
| TypeScript | ~5.8 | 型別系統 |

### UI 與工具

| 套件 | 版本 | 用途 |
|------|------|------|
| Tailwind CSS | 3.4.17 | CSS 框架 |
| Headless UI | 1.7.23 | 無樣式 UI 元件 |
| Heroicons | 2.2.0 | 圖示庫 |
| Axios | 1.11.0 | HTTP 客戶端 |
| VueUse | 13.9.0 | Composition API 工具集 |
| Marked | 16.2.1 | Markdown 渲染 |
| CropperJS | 2.0.1 | 圖片裁切 |

### 建置與測試

| 套件 | 版本 | 用途 |
|------|------|------|
| Vite | 7.0.6 | 建置工具 |
| vue-tsc | 3.0.4 | Vue TypeScript 型別檢查 |
| Vitest | 3.2.4 | 單元測試 |
| Playwright | 1.54.1 | E2E 測試 |

**Node.js 版本要求**：`^20.19.0 || >=22.12.0`

## 系統架構

```
Component / View（呈現層）
    ↓ 呼叫 action
Pinia Store（狀態管理）
    ↓ 呼叫
Service（API 封裝）
    ↓ 呼叫
HttpService（Axios 封裝）
    ↓ HTTP 請求
後端 API
```

### Service 層 (`src/services/`)

`HttpService` 類別（`http.ts`）封裝 Axios，提供：
- 自動附加 JWT Token（從 localStorage 讀取）
- 統一錯誤處理（401 自動清除 Token 並導向登入頁）
- Debug 模式下的請求/回應日誌

11 個領域 Service 各自封裝對應的 API 呼叫：

| Service | 檔案 | 對應後端 API |
|---------|------|-------------|
| authService | `authService.ts` | `/api/auth/*` |
| profileService | `profileService.ts` | `/api/profiles/*` |
| experienceService | `experienceService.ts` | `/api/educations/*`, `/api/workexperiences/*` |
| skillService | `skillService.ts` | `/api/skills/*` |
| portfolioService | `portfolioService.ts` | `/api/portfolios/*` |
| calendarService | `calendarService.ts` | `/api/calendarevents/*` |
| taskService | `taskService.ts` | `/api/todoitems/*` |
| workTrackingService | `workTrackingService.ts` | `/api/worktasks/*` |
| blogService | `blogService.ts` | `/api/blogposts/*` |
| commentService | `commentService.ts` | `/api/guestbookentries/*`, `/api/contactmethods/*` |

### Store 層 (`src/stores/`)

10 個 Pinia Store，搭配 `pinia-plugin-persistedstate` 做 localStorage 持久化：

`auth.ts`、`user.ts`、`profile.ts`、`experience.ts`、`skill.ts`、`portfolio.ts`、`calendar.ts`、`task.ts`、`blog.ts`、`comment.ts`

### View / Component 層

- 使用 Vue 3 Composition API + `<script setup>` 語法
- 11 個公開頁面 + 登入 + 404 + 11 個管理頁面
- 路由使用 `() => import()` 懶載入

### Type 層 (`src/types/`)

TypeScript 介面定義，對應後端 DTO：
- `api.ts`：所有實體介面、`ApiResponse<T>` 型別
- `experience.ts`：學經歷相關型別

## 專案結構

```
PersonalManagerFrontend/
├── package.json
├── vite.config.ts                # Vite 設定（代理、建置最佳化）
├── tsconfig.json                 # TypeScript 設定
├── tailwind.config.js            # Tailwind CSS 設定
├── .env.development              # 開發環境變數
├── .env.production               # 生產環境變數
├── public/                       # 靜態資源
├── src/
│   ├── App.vue                   # 根元件
│   ├── main.ts                   # 應用程式進入點
│   ├── router/
│   │   └── index.ts              # 路由設定（含認證守衛）
│   ├── stores/                   # 10 個 Pinia Store
│   ├── services/                 # 11 個 API Service + HttpService
│   ├── types/                    # TypeScript 型別定義
│   ├── views/                    # 頁面元件
│   │   ├── HomeView.vue          # 首頁
│   │   ├── AboutView.vue         # 關於我
│   │   ├── ExperienceView.vue    # 學經歷
│   │   ├── SkillView.vue         # 專長技能
│   │   ├── PortfolioView.vue     # 作品集
│   │   ├── ProjectDetailView.vue # 作品詳情
│   │   ├── PublicCalendarView.vue# 公開行事曆
│   │   ├── BlogListView.vue      # 部落格列表
│   │   ├── BlogDetailView.vue    # 文章詳情
│   │   ├── GuestbookView.vue     # 留言板
│   │   ├── ContactView.vue       # 聯絡我
│   │   ├── LoginView.vue         # 登入
│   │   ├── NotFoundView.vue      # 404
│   │   └── admin/                # 管理後台（11 個頁面）
│   │       ├── DashboardView.vue
│   │       ├── ProfileManageView.vue
│   │       ├── ExperienceManageView.vue
│   │       ├── SkillManageView.vue
│   │       ├── ProjectManageView.vue
│   │       ├── CalendarManageView.vue
│   │       ├── WorkTrackingView.vue
│   │       ├── TaskManageView.vue
│   │       ├── BlogManageView.vue
│   │       ├── BlogEditorView.vue
│   │       └── CommentManageView.vue
│   ├── components/               # 共用元件
│   │   ├── common/               # 基礎元件（按鈕、輸入框等）
│   │   ├── layout/               # 版面（Header、Footer、Sidebar）
│   │   ├── ui/                   # UI 元件
│   │   ├── admin/                # 管理後台子元件
│   │   ├── blog/                 # 部落格子元件
│   │   ├── calendar/             # 行事曆子元件
│   │   ├── task/                 # 任務子元件
│   │   └── work/                 # 工作追蹤子元件
│   ├── test-utils/               # 測試輔助工具（setup、helpers）
│   └── assets/                   # 靜態資源
```

## 如何執行

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

- 開發伺服器：`http://localhost:5173`
- 需要後端 API 同時運行於 `http://localhost:5037`
- Demo 登入：帳號 `admin`，密碼 `demo123`

## 環境變數

### `.env.development`（開發環境）

```env
VITE_API_BASE_URL=http://localhost:5037/api
VITE_APP_ENV=development
VITE_APP_TITLE=Personal Manager
VITE_DEBUG=true
VITE_ENABLE_PWA=false
VITE_ENABLE_GOOGLE_LOGIN=false
VITE_ENABLE_GITHUB_LOGIN=false
```

### `.env.production`（生產環境）

```env
VITE_API_BASE_URL=https://api.yoursite.com/api
VITE_APP_ENV=production
VITE_APP_TITLE=Personal Manager
VITE_DEBUG=false
```

所有環境變數必須以 `VITE_` 為前綴，才能在前端程式碼中透過 `import.meta.env.VITE_XXX` 存取。

## 如何修改 / 擴充

### 新增一個頁面

1. 在 `src/views/` 建立 `.vue` 檔案，使用 `<script setup lang="ts">` 語法
2. 在 `src/router/index.ts` 新增路由，使用懶載入：
   ```typescript
   {
     path: '/new-page',
     component: () => import('@/views/NewPageView.vue')
   }
   ```
3. 若需要管理後台頁面，加入 `meta: { requiresAuth: true }`

### 新增一個 API Service

1. 在 `src/services/` 建立 `newService.ts`
2. 匯入 `HttpService` 實例，封裝 API 呼叫：
   ```typescript
   import http from './http'

   export const newService = {
     getAll: () => http.get('/new-entity'),
     create: (data: CreateDto) => http.post('/new-entity', data),
   }
   ```

### 新增一個 Store

1. 在 `src/stores/` 建立 `.ts` 檔案
2. 使用 `defineStore` + Composition API 風格：
   ```typescript
   import { defineStore } from 'pinia'
   import { ref } from 'vue'

   export const useNewStore = defineStore('new', () => {
     const items = ref([])
     // ...
     return { items }
   }, { persist: true })
   ```

### 程式碼分割

- 路由層級：已使用 `() => import()` 做懶載入
- Vite 設定中有 `manualChunks` 做 vendor 分割

## 建置與部署

```bash
# 生產建置（含型別檢查）
npm run build

# 預覽建置結果
npm run preview
```

建置產出在 `dist/` 目錄，為純靜態檔案，可部署至任何靜態檔案伺服器（Nginx、Zeabur、Netlify、Vercel 等）。

## 測試

```bash
# 單元測試（Vitest）
npm run test:unit

# E2E 測試（Playwright）
npx playwright install    # 首次需安裝瀏覽器
npm run test:e2e

# 型別檢查
npm run type-check
```

## 相關連結

- [主專案倉庫](https://github.com/hn83320589/personal_manager)
- [後端專案倉庫](https://github.com/hn83320589/PersonalManagerBackend)
