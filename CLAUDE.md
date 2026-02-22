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

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
# → http://localhost:4173
```

### 環境變數

開發環境：`.env.development`（已存在，**不提交至 git**）
```
VITE_API_BASE_URL=http://localhost:5037/api
VITE_APP_TITLE=Personal Manager
```

生產環境：`.env.production`（部署時設定）
```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

> 後端 API port 為 `5037`（非舊文件中的 5253）

---

## 架構說明

### 技術棧

| 項目 | 工具 |
|------|------|
| 框架 | Vue 3.5 Composition API |
| 語言 | TypeScript（嚴格模式） |
| 路由 | Vue Router 4 |
| 狀態管理 | Pinia + pinia-plugin-persistedstate |
| HTTP | Axios（含攔截器） |
| 樣式 | Tailwind CSS |
| 建置 | Vite |
| 單元測試 | Vitest + @vue/test-utils |
| E2E 測試 | Playwright |

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

---

## 專案結構

```
PersonalManagerFrontend/
├── src/
│   ├── main.ts                   # 進入點
│   ├── App.vue                   # 根元件
│   │
│   ├── types/
│   │   ├── api.ts                # 所有 API 介面定義（ApiResponse、實體介面）
│   │   └── experience.ts         # 學經歷相關型別
│   │
│   ├── services/
│   │   ├── http.ts               # Axios 封裝，單例 HttpService
│   │   ├── authService.ts        # /api/auth（login、register、logout）
│   │   ├── profileService.ts     # /api/profiles
│   │   ├── experienceService.ts  # /api/educations、/api/workexperiences
│   │   ├── skillService.ts       # /api/skills
│   │   ├── portfolioService.ts   # /api/portfolios
│   │   ├── calendarService.ts    # /api/calendarevents
│   │   ├── taskService.ts        # /api/todoitems
│   │   ├── workTrackingService.ts # /api/worktasks
│   │   ├── blogService.ts        # /api/blogposts
│   │   └── commentService.ts     # /api/guestbookentries、/api/contactmethods
│   │
│   ├── stores/
│   │   ├── auth.ts               # 認證狀態（token、user info、isLoggedIn）
│   │   ├── user.ts               # 使用者資料
│   │   ├── profile.ts            # 個人資料
│   │   ├── experience.ts         # 學歷 + 工作經歷
│   │   ├── skill.ts              # 技能
│   │   ├── portfolio.ts          # 作品集
│   │   ├── calendar.ts           # 行事曆
│   │   ├── task.ts               # 待辦事項 + 工作追蹤
│   │   ├── blog.ts               # 部落格文章
│   │   └── comment.ts            # 留言
│   │
│   ├── router/
│   │   └── index.ts              # 路由定義（公開 + 需要認證的路由）
│   │
│   ├── views/
│   │   ├── HomeView.vue          # 首頁
│   │   ├── AboutView.vue         # 關於我
│   │   ├── ExperienceView.vue    # 學經歷展示
│   │   ├── SkillView.vue         # 技能展示
│   │   ├── PortfolioView.vue     # 作品集列表
│   │   ├── ProjectDetailView.vue # 作品詳細
│   │   ├── PublicCalendarView.vue # 公開行事曆
│   │   ├── BlogListView.vue      # 部落格列表
│   │   ├── BlogDetailView.vue    # 文章內容
│   │   ├── GuestbookView.vue     # 留言板
│   │   ├── ContactView.vue       # 聯絡我
│   │   ├── LoginView.vue         # 登入
│   │   ├── NotFoundView.vue      # 404
│   │   └── admin/
│   │       ├── DashboardView.vue     # 管理儀表板
│   │       ├── ProfileManageView.vue # 個人資料管理
│   │       ├── ExperienceManageView.vue # 學經歷管理
│   │       ├── SkillManageView.vue   # 技能管理
│   │       ├── ProjectManageView.vue # 作品管理
│   │       ├── CalendarManageView.vue # 行事曆管理
│   │       ├── WorkTrackingView.vue  # 工作追蹤
│   │       ├── TaskManageView.vue    # 待辦事項管理
│   │       ├── BlogManageView.vue    # 文章管理
│   │       ├── BlogEditorView.vue    # 文章編輯器
│   │       └── CommentManageView.vue # 留言管理
│   │
│   ├── components/
│   │   ├── layout/               # AppHeader、AppFooter、AppSidebar、AdminLayout
│   │   ├── ui/                   # BaseButton、BaseCard、BaseInput、BaseModal 等
│   │   ├── common/               # LoadingSpinner 等
│   │   ├── admin/                # 管理後台專用表單元件
│   │   ├── blog/                 # BlogGridView、BlogTableView
│   │   ├── calendar/             # CalendarGrid、WeekView
│   │   ├── task/                 # TaskListView、TaskKanbanView、TaskGridView
│   │   └── work/                 # ProjectsView、TasksView、TimesheetView、ReportsView
│   │
│   ├── assets/                   # 圖片、CSS
│   └── test-utils/               # 測試輔助工具
│
├── .env.development              # 開發環境變數（不提交）
├── .env.production               # 生產環境變數（不提交）
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

---

## 路由結構

### 公開路由（不需登入）

| 路徑 | View |
|------|------|
| `/` | HomeView |
| `/about` | AboutView |
| `/experience` | ExperienceView |
| `/skills` | SkillView |
| `/portfolio` | PortfolioView |
| `/portfolio/:id` | ProjectDetailView |
| `/calendar` | PublicCalendarView |
| `/blog` | BlogListView |
| `/blog/:slug` | BlogDetailView |
| `/guestbook` | GuestbookView |
| `/contact` | ContactView |
| `/login` | LoginView |

### 管理後台路由（需要登入，路由守衛保護）

| 路徑 | View |
|------|------|
| `/admin` | DashboardView |
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

1. 在 `src/types/api.ts` 中定義介面（camelCase 欄位）
2. 在對應的 `src/services/xxxService.ts` 中新增方法
3. 在對應的 `src/stores/xxx.ts` 中新增 action
4. 在 View/Component 中呼叫 store action

### 新增一個頁面

1. 在 `src/views/` 建立 `.vue` 檔案
2. 在 `src/router/index.ts` 新增路由
3. 若需要認證，在路由 `meta` 加上 `{ requiresAuth: true }`

### 新增一個 Service

參考現有 service 檔案結構（如 `skillService.ts`）：
```typescript
import { httpService } from './http'
import type { ApiResponse, Skill, CreateSkillDto } from '@/types/api'

export const skillService = {
  getAll: () => httpService.get<Skill[]>('/skills'),
  getById: (id: number) => httpService.get<Skill>(`/skills/${id}`),
  create: (dto: CreateSkillDto) => httpService.post<Skill>('/skills', dto),
  update: (id: number, dto: Partial<CreateSkillDto>) => httpService.put<Skill>(`/skills/${id}`, dto),
  delete: (id: number) => httpService.delete<void>(`/skills/${id}`),
}
```

---

## 設計規範

- **色調**：淺灰、淺藍、白色為主，冷色調，低色溫
- **風格**：現代線條設計，圓角矩形，無複雜色彩
- **元件**：基礎 UI 元件在 `src/components/ui/`，直接使用，不重複建立
- **TypeScript**：嚴格模式，不使用 `any`，所有 prop 需要型別定義

---

## 開發注意事項

- **不要修改 `http.ts` 的攔截器邏輯**，除非有明確需求
- **所有 API 欄位用 camelCase**，與後端 JSON 序列化一致
- **Store 中的資料是 reactive**，直接修改 store state 可能造成意外副作用，透過 action 修改
- **build 前確認 TypeScript 無錯誤**：`npm run type-check`

---

## 最新異動記錄

### 2026/02/22
- **API base URL 確認**：後端 port 為 `5037`（`.env.development` 已更新）
- **欄位對齊驗證**：`src/types/api.ts` 中所有介面與後端 DTO 欄位確認一致（camelCase）
- **前後端整合測試通過**：登入、技能、個人資料、部落格等核心 API 均正常回應
