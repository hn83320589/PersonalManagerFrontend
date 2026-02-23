# CLAUDE.md - PersonalManager Frontend

This file provides guidance to Claude Code when working with the frontend codebase.

---

## 快速啟動

```bash
# 安裝依賴（首次或 package.json 有變動時）
npm install

# 開發模式啟動
npm run dev
# → http://localhost:5173

# 建置生產版本（含型別檢查）
npm run build

# 型別檢查
npm run type-check
```

### 環境變數

開發環境：`.env.development`（已存在，**不提交至 git**）
```
VITE_API_BASE_URL=http://localhost:5037/api
VITE_APP_TITLE=Personal Manager
```

生產環境：Zeabur 環境變數設定 `VITE_API_BASE_URL`。

> 後端 API port 為 `5037`

---

## 架構說明

### 技術棧

| 項目 | 工具/版本 |
|------|-----------|
| 框架 | Vue 3.5 Composition API + `<script setup>` |
| 語言 | TypeScript（嚴格模式） |
| 路由 | Vue Router 4 |
| 狀態管理 | Pinia + pinia-plugin-persistedstate v4 |
| HTTP | Axios（含攔截器） |
| 樣式 | Tailwind CSS 3 |
| 圖示 | Heroicons v2 |
| 建置 | Vite 7 |
| 測試 | Vitest（單元）+ Playwright（E2E） |

### 資料流

```
View（.vue）
  → Store（Pinia）
  → Service（API calls）
  → HttpService（Axios + 攔截器）
  → 後端 API（http://localhost:5037/api）
```

### HTTP 攔截器（`src/services/http.ts`）

- **請求**：自動從 `authStore` 取得 JWT token，加入 `Authorization: Bearer ...` header
- **回應**：解包 `ApiResponse<T>` wrapper，回傳 `.data`
- **錯誤**：401 自動登出並導向 `/login`

### API 回應格式

後端統一回傳 camelCase JSON：
```typescript
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors: string[] | null
}
```

### Store 持久化

`pinia-plugin-persistedstate` v4 語法（composition API store 需要三參數形式）：
```typescript
export const useTaskStore = defineStore('task', () => {
  // ...
  return { timeEntries }
}, { persist: { pick: ['timeEntries'] } })  // 只持久化指定欄位
```

---

## 專案結構

```
PersonalManagerFrontend/
├── src/
│   ├── main.ts                       # 進入點（Pinia + persistedstate + Router 掛載）
│   ├── App.vue                       # 根元件
│   │
│   ├── types/
│   │   ├── api.ts                    # 所有 API 介面定義（ApiResponse、實體介面）
│   │   └── experience.ts             # 學經歷相關型別
│   │
│   ├── services/
│   │   ├── http.ts                   # Axios 封裝，HttpService 單例
│   │   ├── authService.ts            # /api/auth（login、register、logout）
│   │   ├── profileService.ts         # /api/profiles
│   │   ├── experienceService.ts      # /api/educations、/api/workexperiences
│   │   ├── skillService.ts           # /api/skills
│   │   ├── portfolioService.ts       # /api/portfolios
│   │   ├── calendarService.ts        # /api/calendarevents
│   │   ├── taskService.ts            # /api/todoitems
│   │   ├── workTrackingService.ts    # /api/worktasks
│   │   ├── blogService.ts            # /api/blogposts
│   │   ├── commentService.ts         # /api/guestbookentries、/api/contactmethods
│   │   └── userDirectoryService.ts   # /api/profiles/directory、/api/users/public
│   │
│   ├── stores/
│   │   ├── auth.ts                   # 認證狀態（token、user info、isLoggedIn）
│   │   ├── user.ts                   # 使用者資料
│   │   ├── profile.ts                # 個人資料
│   │   ├── experience.ts             # 學歷 + 工作經歷
│   │   ├── skill.ts                  # 技能
│   │   ├── portfolio.ts              # 作品集
│   │   ├── calendar.ts               # 行事曆
│   │   ├── task.ts                   # 待辦事項 + 工作任務 + 時間記錄（timeEntries 持久化）
│   │   ├── blog.ts                   # 部落格文章
│   │   ├── comment.ts                # 留言
│   │   └── userDirectory.ts          # 用戶目錄與 username → userId 解析
│   │
│   ├── composables/
│   │   └── useTheme.ts               # 5 套主題 CSS 變數（blue/green/purple/rose/slate）
│   │
│   ├── router/
│   │   └── index.ts                  # 路由定義（/@:username 架構 + admin 路由守衛）
│   │
│   ├── views/
│   │   ├── HomeView.vue              # 首頁（用戶目錄，格狀卡片 + 搜尋）
│   │   ├── LoginView.vue             # 登入
│   │   ├── NotFoundView.vue          # 404
│   │   ├── user/                     # 個人頁面（/@:username 路由，由 UserLayout 包覆）
│   │   │   ├── UserAboutView.vue     # 關於我
│   │   │   ├── UserExperienceView.vue # 學經歷
│   │   │   ├── UserSkillView.vue     # 技能
│   │   │   ├── UserPortfolioView.vue # 作品集
│   │   │   ├── UserProjectDetailView.vue # 作品詳情
│   │   │   ├── UserBlogListView.vue  # 部落格列表
│   │   │   ├── UserBlogDetailView.vue # 文章詳情
│   │   │   ├── UserCalendarView.vue  # 公開行事曆
│   │   │   ├── UserGuestbookView.vue # 留言板
│   │   │   └── UserContactView.vue  # 聯絡我
│   │   └── admin/                    # 管理後台
│   │       ├── DashboardView.vue
│   │       ├── ProfileManageView.vue
│   │       ├── ExperienceManageView.vue
│   │       ├── SkillManageView.vue
│   │       ├── ProjectManageView.vue
│   │       ├── CalendarManageView.vue
│   │       ├── WorkTrackingView.vue  # 工作追蹤（任務 + 時間記錄 + 報告）
│   │       ├── TaskManageView.vue
│   │       ├── BlogManageView.vue
│   │       ├── BlogEditorView.vue
│   │       └── CommentManageView.vue
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue         # 公開頁首（首頁 + 登入頁使用）
│   │   │   ├── AppFooter.vue
│   │   │   ├── AdminLayout.vue       # 管理後台版面（側欄 + 頂列）
│   │   │   └── UserLayout.vue        # 個人頁面版面（主題、用戶 Header、水平導覽）
│   │   ├── ui/                       # BaseButton、BaseCard、BaseInput、BaseModal 等
│   │   ├── common/                   # LoadingSpinner 等共用元件
│   │   ├── admin/                    # 管理後台專用表單元件
│   │   ├── blog/                     # BlogGridView、BlogTableView
│   │   ├── calendar/                 # CalendarGrid、WeekView
│   │   ├── task/                     # TaskListView、TaskKanbanView、TaskGridView
│   │   └── work/                     # ProjectsView、TasksView、TimesheetView、ReportsView
│   │
│   ├── assets/
│   │   └── main.css                  # Tailwind 全局樣式（含 .form-input、.form-select）
│   └── test-utils/                   # 測試輔助工具
│
├── .env.development                  # 開發環境變數（不提交）
├── .env.production                   # 生產環境變數（不提交）
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

---

## 路由結構

### 公開路由（不需登入）

| 路徑 | View | 說明 |
|------|------|------|
| `/` | HomeView | 用戶目錄（格狀卡片） |
| `/login` | LoginView | 登入 |
| `/@:username` | UserAboutView | 個人頁面（UserLayout 包覆） |
| `/@:username/experience` | UserExperienceView | 學經歷 |
| `/@:username/skills` | UserSkillView | 技能 |
| `/@:username/portfolio` | UserPortfolioView | 作品集 |
| `/@:username/portfolio/:id` | UserProjectDetailView | 作品詳情 |
| `/@:username/blog` | UserBlogListView | 部落格列表 |
| `/@:username/blog/:slug` | UserBlogDetailView | 文章詳情 |
| `/@:username/calendar` | UserCalendarView | 公開行事曆 |
| `/@:username/guestbook` | UserGuestbookView | 留言板 |
| `/@:username/contact` | UserContactView | 聯絡我 |

### 管理後台路由（需要登入，路由守衛保護）

| 路徑 | View |
|------|------|
| `/admin/dashboard` | DashboardView |
| `/admin/profile` | ProfileManageView |
| `/admin/experience` | ExperienceManageView |
| `/admin/skills` | SkillManageView |
| `/admin/projects` | ProjectManageView |
| `/admin/calendar` | CalendarManageView |
| `/admin/work-tracking` | WorkTrackingView |
| `/admin/tasks` | TaskManageView |
| `/admin/blog` | BlogManageView |
| `/admin/blog/new` | BlogEditorView |
| `/admin/blog/:id/edit` | BlogEditorView |
| `/admin/comments` | CommentManageView |

---

## 如何新增功能

### 新增一個 API 呼叫

1. 在 `src/types/api.ts` 定義介面（camelCase 欄位）
2. 在對應的 `src/services/xxxService.ts` 新增方法
3. 在對應的 `src/stores/xxx.ts` 新增 action
4. 在 View/Component 中呼叫 store action

### 新增一個頁面

1. 在 `src/views/` 建立 `.vue` 檔案
2. 在 `src/router/index.ts` 新增路由（使用懶載入 `() => import(...)`）
3. 若需要認證，路由 `meta` 加 `{ requiresAuth: true }`

### 新增一個 Service

```typescript
import httpService from './http'
import type { ApiResponse, Skill } from '@/types/api'

export const skillService = {
  getAll: () => httpService.get<Skill[]>('/skills'),
  getById: (id: number) => httpService.get<Skill>(`/skills/${id}`),
  create: (dto: CreateSkillDto) => httpService.post<Skill>('/skills', dto),
  update: (id: number, dto: Partial<CreateSkillDto>) => httpService.put<Skill>(`/skills/${id}`, dto),
  delete: (id: number) => httpService.delete<void>(`/skills/${id}`),
}
```

### UserLayout 與 provide/inject

`UserLayout.vue` 透過 `provide('userId', userId)` 傳遞 userId 給子頁面，子頁面用 `inject<Ref<number>>('userId')` 取得：
```typescript
// UserLayout.vue
provide('userId', userId)  // userId = ref<number>(resolved from username)

// UserAboutView.vue
const userId = inject<Ref<number>>('userId')!
```

---

## 設計規範

- **色調**：淺灰、淺藍、白色為主，冷色調
- **元件**：基礎 UI 元件在 `src/components/ui/`，直接使用，不重複建立
- **表單樣式**：使用 `src/assets/main.css` 定義的 `.form-input`、`.form-select`、`.form-label`，確保文字顏色可見
- **TypeScript**：嚴格模式，不使用 `any`，所有 prop 需要型別定義
- **主題**：個人頁面透過 `useTheme(themeColor)` 取得 CSS 變數，套用至 UserLayout 的 `:style`

---

## 開發注意事項

- **不要修改 `http.ts` 的攔截器邏輯**，除非有明確需求
- **所有 API 欄位用 camelCase**，與後端 JSON 序列化一致
- **build 前確認 TypeScript 無錯誤**：`npm run type-check`
- **pinia-plugin-persistedstate v4**：compose store 需用三參數 `defineStore(id, setup, { persist })`，舊版 v3 語法不相容
- **Admin 頁面取得 userId**：從 `authStore.user?.id` 取得，不可 hardcode `1`

---

## 最新異動記錄

### 2026/02/23
- **多使用者架構大改寫**：
  - `src/types/api.ts` 新增 `PublicUser`、`ProfileDirectory`；`PersonalProfile` 加 `themeColor`；`GuestBookEntry` 加 `targetUserId`；`AuthResponse` 新增 `userId`
  - `src/services/userDirectoryService.ts` — 新增，呼叫 `/profiles/directory`、`/users/public/{username}` 等端點
  - `src/services/commentService.ts` — 新增 `getApprovedByUser(targetUserId)` 和支援 `targetUserId` 的 `createGuestBookEntry`
  - `src/stores/userDirectory.ts` — 新增，管理 profiles 目錄和 username 解析
  - `src/composables/useTheme.ts` — 新增，提供 5 套主題 CSS 變數（blue/green/purple/rose/slate）
  - `src/router/index.ts` — 路由重構：移除舊扁平路由（`/about`、`/skills` 等），新增 `/@:username` 巢狀路由架構
  - `src/components/layout/UserLayout.vue` — 新增核心 Layout，負責解析 username、套用主題、顯示個人 Header + 水平導覽
  - `src/views/HomeView.vue` — 改寫為用戶目錄頁（搜尋 + 格狀卡片）
  - `src/views/user/` — 新增 10 個頁面（UserAboutView、UserExperienceView 等）
  - `src/components/layout/AppHeader.vue` — 簡化導覽，修正 user menu 連結為 `/admin/dashboard`、`/admin/profile`
  - `src/views/admin/ProfileManageView.vue` — 移除 hardcoded `userId=1`，改用 `authStore.user?.id`；改呼叫真實 API；新增 5 色主題選擇器
  - `src/assets/main.css` — 新增 `.form-input`、`.form-select`、`.form-label` 全局 class
- **Bug 修復**：
  - `src/services/authService.ts` — 登入/註冊時將 `id: response.data.userId` 存入 `user_data`，修復頁面重整後 userId 為 undefined 的問題
  - `src/views/admin/CommentManageView.vue` — `submitReply()` 中 `adminReply` 欄位未傳送已修正
  - `src/stores/task.ts` — 時間記錄（TimeEntry）改為本地實作 + `pinia-plugin-persistedstate` 持久化；`TimesheetView.vue` 新增 `add-entry` emit
  - `src/components/layout/AdminLayout.vue` — 移除 `/admin/files`（檔案管理）和 `/admin/settings`（系統設定）尚未實作的導覽項目及 `FolderIcon`、`Cog6ToothIcon` 匯入

### 2026/02/22
- **API base URL 確認**：後端 port 為 `5037`（`.env.development` 已更新）
- **欄位對齊驗證**：`src/types/api.ts` 中所有介面與後端 DTO 欄位確認一致（camelCase）
- **前後端整合測試通過**：登入、技能、個人資料、部落格等核心 API 均正常回應
