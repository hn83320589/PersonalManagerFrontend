# CLAUDE.md - PersonalManager Frontend

This file provides guidance to Claude Code (claude.ai/code) when working with the frontend code in this repository.

## 專案說明

這是Personal Manager系統的前端專案，使用Vue3 + TypeScript開發，提供個人管理系統的使用者介面。

## 技術架構

- **框架**: Vue 3.5 with Composition API
- **語言**: TypeScript
- **路由**: Vue Router 4
- **狀態管理**: Pinia
- **建置工具**: Vite
- **CSS框架**: 待定 (建議使用 Tailwind CSS 或 Element Plus)
- **HTTP客戶端**: Axios
- **測試框架**: Vitest (單元測試) + Playwright (E2E測試)

## 專案結構

```
PersonalManagerFrontend/
├── src/
│   ├── components/       # 共用元件
│   │   ├── common/      # 基礎共用元件
│   │   ├── layout/      # 版面配置元件
│   │   └── ui/          # UI元件
│   ├── views/           # 頁面元件
│   │   ├── auth/        # 驗證相關頁面
│   │   ├── profile/     # 個人資料頁面
│   │   ├── admin/       # 管理後台頁面
│   │   └── public/      # 公開頁面
│   ├── router/          # 路由設定
│   ├── stores/          # Pinia狀態管理
│   ├── services/        # API服務
│   ├── types/           # TypeScript型別定義
│   ├── utils/           # 工具函式
│   ├── assets/          # 靜態資源
│   └── styles/          # 樣式檔案
├── public/              # 公用資源
└── tests/               # 測試檔案
```

## 頁面規劃

### 公開頁面 (無需登入)
1. **首頁** - 個人介紹概覽
2. **關於我** - 詳細個人介紹
3. **學經歷** - 教育背景與工作經歷
4. **專長技能** - 技能展示
5. **作品集** - 專案作品展示
6. **公開行事曆** - 公開的行程安排
7. **部落格** - 公開文章列表與內容
8. **留言板** - 訪客留言功能
9. **聯絡我** - 聯絡資訊與表單

### 需要登入的頁面
10. **登入頁面** - 使用者登入
11. **管理儀表板** - 個人管理總覽
12. **個人資料管理** - 編輯個人資訊
13. **學經歷管理** - 新增/編輯學經歷
14. **專長管理** - 管理技能資料
15. **作品管理** - 管理專案作品
16. **行事曆管理** - 完整行事曆功能
17. **工作追蹤** - 工作進度追蹤
18. **待辦事項** - 個人任務管理
19. **文章管理** - 撰寫/編輯部落格文章
20. **留言管理** - 管理訪客留言

## 待辦事項追蹤

### 基礎設定與工具
- [ ] 安裝並設定UI框架 (Tailwind CSS / Element Plus)
- [ ] 安裝並設定Axios HTTP客戶端
- [ ] 設定環境變數管理
- [ ] 建立API服務基礎架構
- [ ] 設定全域樣式與主題
- [ ] 建立響應式設計系統

### 型別定義 (TypeScript)
- [ ] 定義User相關型別
- [ ] 定義Profile相關型別
- [ ] 定義Experience相關型別
- [ ] 定義Skill相關型別
- [ ] 定義Project相關型別
- [ ] 定義Calendar相關型別
- [ ] 定義Task相關型別
- [ ] 定義WorkTracking相關型別
- [ ] 定義BlogPost相關型別
- [ ] 定義Comment相關型別
- [ ] 定義API回應格式型別

### 狀態管理 (Pinia Stores)
- [ ] 建立authStore (驗證狀態管理)
- [ ] 建立userStore (使用者資料)
- [ ] 建立profileStore (個人資料)
- [ ] 建立experienceStore (學經歷)
- [ ] 建立skillStore (專長)
- [ ] 建立projectStore (作品)
- [ ] 建立calendarStore (行事曆)
- [ ] 建立taskStore (待辦事項)
- [ ] 建立workTrackingStore (工作追蹤)
- [ ] 建立blogStore (部落格)
- [ ] 建立commentStore (留言)

### API服務層
- [ ] 建立authService (登入/登出)
- [ ] 建立profileService
- [ ] 建立experienceService
- [ ] 建立skillService
- [ ] 建立projectService
- [ ] 建立calendarService
- [ ] 建立taskService
- [ ] 建立workTrackingService
- [ ] 建立blogService
- [ ] 建立commentService
- [ ] 建立HTTP攔截器 (請求/回應處理)

### 共用元件開發
- [ ] Header/Navigation 元件
- [ ] Footer 元件
- [ ] Sidebar 元件
- [ ] Loading 元件
- [ ] Modal/Dialog 元件
- [ ] Form 相關元件
- [ ] Table 元件
- [ ] Card 元件
- [ ] Button 元件
- [ ] Input 元件系列

### 公開頁面開發
- [ ] 首頁 (HomeView)
- [ ] 關於我頁面 (AboutView)
- [ ] 學經歷展示頁面 (ExperienceView)
- [ ] 專長技能頁面 (SkillView)
- [ ] 作品集頁面 (ProjectView)
- [ ] 作品詳細頁面 (ProjectDetailView)
- [ ] 公開行事曆頁面 (PublicCalendarView)
- [ ] 部落格列表頁面 (BlogListView)
- [ ] 部落格文章頁面 (BlogDetailView)
- [ ] 留言板頁面 (GuestbookView)
- [ ] 聯絡我頁面 (ContactView)

### 管理頁面開發
- [ ] 登入頁面 (LoginView)
- [ ] 管理儀表板 (DashboardView)
- [ ] 個人資料管理 (ProfileManageView)
- [ ] 學經歷管理 (ExperienceManageView)
- [ ] 專長管理 (SkillManageView)
- [ ] 作品管理 (ProjectManageView)
- [ ] 行事曆管理 (CalendarManageView)
- [ ] 工作追蹤 (WorkTrackingView)
- [ ] 待辦事項 (TaskManageView)
- [ ] 文章管理 (BlogManageView)
- [ ] 文章編輯器 (BlogEditorView)
- [ ] 留言管理 (CommentManageView)

### 路由設定
- [ ] 設定公開路由
- [ ] 設定需要驗證的路由
- [ ] 實作路由守衛 (Route Guard)
- [ ] 設定404錯誤頁面
- [ ] 設定動態路由

### 功能實作
- [ ] 使用者登入/登出功能
- [ ] JWT Token管理
- [ ] 響應式設計適配
- [ ] 圖片上傳功能
- [ ] 檔案管理功能
- [ ] 搜尋功能
- [ ] 分頁功能
- [ ] 排序與篩選功能
- [ ] 表單驗證
- [ ] 錯誤處理與提示

### 測試開發
- [ ] 設定測試環境
- [ ] 撰寫元件單元測試
- [ ] 撰寫Store單元測試
- [ ] 撰寫Service單元測試
- [ ] 撰寫E2E測試腳本

### 效能優化
- [ ] 實作懶載入 (Lazy Loading)
- [ ] 圖片優化處理
- [ ] 程式碼分割 (Code Splitting)
- [ ] 快取策略實作
- [ ] SEO優化

### 部署準備
- [ ] 建立生產環境建置設定
- [ ] 設定環境變數
- [ ] 建立Docker設定
- [ ] 準備靜態資源部署

## 常用指令

### 開發指令
```bash
# 啟動開發伺服器
npm run dev

# 建置專案
npm run build

# 預覽建置結果
npm run preview

# 執行測試
npm run test:unit
npm run test:e2e

# 程式碼檢查
npm run lint

# 型別檢查
npm run type-check
```

### 套件管理
```bash
# 安裝依賴
npm install

# 新增套件
npm install package-name

# 新增開發依賴
npm install -D package-name
```

## 開發紀錄

### 2025/08/08 - 前端專案初始化
- 建立Vue3 + TypeScript專案
- 設定Vue Router、Pinia狀態管理
- 設定Vitest與Playwright測試框架
- 開發伺服器成功啟動 (localhost:5173)

## 注意事項

- 所有API調用都需要適當的錯誤處理
- 使用TypeScript嚴格模式，確保型別安全
- 遵循Vue3 Composition API最佳實踐
- 實作響應式設計，支援行動裝置
- 注意使用者體驗(UX)與無障礙設計
- 敏感資料(如Token)需要安全儲存
- 所有元件都需要撰寫對應的測試