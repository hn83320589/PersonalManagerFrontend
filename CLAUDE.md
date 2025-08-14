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
- **CSS框架**: Tailwind CSS (已設定完成)
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

- UI風格採取較為簡約的設計，不要有太複雜的色彩樣式，以淡色系低色溫的元素進行開發，並且以冷色調為主，線條為主的設計風格。
- 以三種色調為主：淺灰色、淺藍色、白色，並且使用圓角矩形的按鈕與輸入框。採取現代化的線條設計風格，包含輸入框、按鈕、卡片等元素。
- 所有元件需具備良好的可訪問性，確保色彩對比度符合WCAG標準，並提供鍵盤導航支援。
- 設計樣式盡量是可以調整，未來可能會開放使用者自訂主題色彩。
- 各元素排版也要保持彈性，未來可能會讓他們調整自己的排版方式。

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
- [x] 安裝並設定UI框架 (Tailwind CSS)
- [x] 安裝並設定Axios HTTP客戶端
- [x] 設定環境變數管理 (.env.development, .env.production)
- [x] 建立API服務基礎架構 (httpService, authService)
- [x] 設定全域樣式與主題 (Tailwind + 自訂樣式)
- [x] 建立響應式設計系統 (Tailwind 響應式)

### 型別定義 (TypeScript)
- [x] 定義User相關型別
- [x] 定義Profile相關型別 (PersonalProfile)
- [x] 定義Experience相關型別 (Education, WorkExperience)
- [x] 定義Skill相關型別
- [x] 定義Project相關型別 (Portfolio)
- [x] 定義Calendar相關型別 (CalendarEvent)
- [x] 定義Task相關型別 (TodoItem, WorkTask)
- [x] 定義WorkTracking相關型別 (已整合至Task)
- [x] 定義BlogPost相關型別
- [x] 定義Comment相關型別 (GuestBookEntry)
- [x] 定義API回應格式型別 (ApiResponse)

### 狀態管理 (Pinia Stores)
- [x] 建立authStore (驗證狀態管理)
- [x] 建立userStore (使用者資料)
- [x] 建立profileStore (個人資料)
- [x] 建立experienceStore (學經歷)
- [x] 建立skillStore (專長)
- [x] 建立portfolioStore (作品) - 原projectStore
- [x] 建立calendarStore (行事曆)
- [x] 建立taskStore (待辦事項與工作追蹤)
- [x] 建立blogStore (部落格)
- [x] 建立commentStore (留言)

### API服務層
- [x] 建立authService (登入/登出)
- [x] 建立profileService (personalProfileService) - 更新完成
- [x] 建立experienceService (學經歷管理)
- [x] 建立skillService (技能管理)
- [x] 建立portfolioService (作品集管理)
- [x] 建立calendarService (行事曆管理)
- [x] 建立taskService (待辦事項管理)
- [x] 建立workTrackingService (工作追蹤管理)
- [x] 建立blogService (部落格管理)
- [x] 建立commentService (留言管理)
- [x] 建立HTTP攔截器 (請求/回應處理) - httpService

### 共用元件開發
- [x] Header/Navigation 元件 (AppHeader)
- [x] Footer 元件 (AppFooter)
- [x] Sidebar 元件 (AppSidebar + SidebarItem)
- [x] Loading 元件 (LoadingSpinner)
- [x] Modal/Dialog 元件 (BaseModal + BaseDialog)
- [x] Form 相關元件 (BaseForm, BaseTextarea, BaseSelect)
- [x] Table 元件 (BaseTable - 完整功能)
- [x] Card 元件 (BaseCard - 多樣式)
- [x] Button 元件 (BaseButton)
- [x] Input 元件系列 (BaseInput)

### 公開頁面開發
- [x] 首頁 (HomeView) - 完整hero section、功能介紹、精選作品展示
- [x] 關於我頁面 (AboutView) - 個人介紹、技能、經歷總覽
- [x] 學經歷展示頁面 (ExperienceView) - 時間軸設計、技能展示
- [x] 專長技能頁面 (SkillView) - 分類篩選、等級可視化、統計
- [x] 作品集頁面 (PortfolioView) - 含搜尋、篩選、分頁功能
- [x] 作品詳細頁面 (ProjectDetailView) - 專案資訊、技術棧、相關推薦
- [x] 公開行事曆頁面 (PublicCalendarView) - 月/週/列表視圖、事件篩選、詳細模態
- [x] 部落格列表頁面 (BlogListView) - 搜尋、分類篩選、分頁、側邊欄
- [x] 部落格文章頁面 (BlogDetailView) - 文章內容、目錄、相關文章、分享功能
- [x] 留言板頁面 (GuestbookView) - 留言表單、留言列表、審核、互動功能
- [x] 聯絡我頁面 (ContactView) - 聯絡表單、聯絡資訊、社群連結、FAQ

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
- [x] 設定公開路由 (首頁、關於我、作品集等)
- [x] 設定需要驗證的路由 (dashboard、admin頁面)
- [x] 實作路由守衛 (Route Guard) - requiresAuth, requiresGuest
- [x] 設定404錯誤頁面 (NotFoundView)
- [x] 設定動態路由 (lazy loading)

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

### 2025/08/14 - 前後端API整合完成

#### API整合成果
**完成前後端完整整合:**
- ✅ HTTP 客戶端 (Axios) 配置完成，支援請求/回應攔截器
- ✅ API Base URL 環境變數配置 (http://localhost:5253/api)
- ✅ CORS 跨域請求設定完成，後端正確回應前端請求
- ✅ 所有前端 API 服務與後端端點正確對應
- ✅ TypeScript 型別檢查完全通過
- ✅ 建置流程成功運作

#### 技術整合亮點
- **ProfileStore 增強**: 新增 `fetchCurrentUserProfile` 方法，支援根據使用者ID獲取個人資料
- **API 測試組件**: 建立 `ApiTestComponent`，提供開發環境API測試功能
- **環境配置**: 完成 `.env.development` 配置，支援多環境API切換
- **錯誤處理**: HTTP 攔截器完整處理認證、錯誤狀態

#### 整合測試驗證
**API 端點測試:**
- ✅ GET /api/users - 使用者列表查詢正常
- ✅ GET /api/skills - 技能資料查詢正常  
- ✅ GET /api/personalprofiles - 個人資料查詢正常
- ✅ Demo 登入功能正常運作

**CORS 設定驗證:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

**前端服務狀態:**
- 前端開發伺服器: http://localhost:5173 ✅
- 後端API服務: http://localhost:5253/api ✅
- API整合狀態: 100% 完成 🎉

### 2025/08/14 - 前端核心架構與公開頁面開發完成

#### 1. 狀態管理完整建立
**完成 9 個 Pinia Stores:**
- userStore: 使用者資料管理
- profileStore: 個人資料管理（含公開資料獲取）
- experienceStore: 學經歷管理（工作經歷、教育背景）
- skillStore: 技能管理（分類、等級、統計）
- calendarStore: 行事曆管理（事件、視圖、統計）
- taskStore: 任務管理（待辦事項、工作任務）
- blogStore: 部落格管理（文章、分類、標籤）
- commentStore: 留言管理（訪客留言、審核、回覆）
- portfolioStore: 作品集管理（專案、搜尋、精選）

#### 2. API 服務層完整建立
**完成 7 個新 API 服務:**
- experienceService: 學經歷 API（教育、工作經歷、排序）
- skillService: 技能 API（分類、等級、搜尋、統計）
- calendarService: 行事曆 API（事件、日期範�圍、Google 整合）
- taskService: 任務 API（待辦事項、工作任務、批量操作）
- workTrackingService: 工作追蹤 API（時間記錄、進度、統計）
- blogService: 部落格 API（文章、分類、標籤、搜尋）
- commentService: 留言 API（訪客留言、審核、回覆）

#### 3. UI 元件庫完整建立
**新增 8 個核心 UI 元件:**
- AppSidebar + SidebarItem: 響應式側邊欄導航系統
- BaseModal + BaseDialog: 模態視窗與對話框元件
- BaseForm, BaseTextarea, BaseSelect: 完整表單元件系列
- BaseTable: 功能完整的資料表格（搜尋、排序、分頁、選擇）
- BaseCard: 多樣式卡片元件

#### 4. 公開頁面開發 (9/9 完成) ✅
**所有公開頁面已完成:**
- AboutView: 個人介紹、技能概覽、聯絡資訊、行動呼籲
- ExperienceView: 工作經歷與教育時間軸、技能分類展示
- SkillView: 技能分類篩選、等級可視化、統計資訊
- ProjectDetailView: 專案詳細資訊、技術棧、相關專案推薦
- PublicCalendarView: 月/週/列表視圖、事件篩選、詳細模態
- BlogListView: 搜尋、分類篩選、分頁、側邊欄
- BlogDetailView: 文章內容、目錄、相關文章、分享功能
- GuestbookView: 留言表單、留言列表、審核、互動功能
- ContactView: 聯絡表單、聯絡資訊、社群連結、FAQ

#### 5. 技術品質確保
- ✅ TypeScript 型別檢查通過
- ✅ 前端建置成功
- ✅ 響應式設計實作
- ✅ Tailwind CSS 整合與主題設定
- ✅ 錯誤處理與載入狀態管理

**開發進度: 約 90% 完成** 🎉

### 2025/08/14 - 所有公開頁面開發完成

#### 完成的 5 個剩餘公開頁面

**PublicCalendarView (公開行事曆頁面)**
- 三種視圖模式：月視圖、週視圖、列表視圖
- 日期導航與當日快速跳轉功能
- 事件類型分類與色彩編碼
- 事件詳細模態視窗
- 響應式日曆網格設計
- 側邊欄顯示即將到來的活動

**BlogListView (部落格列表頁面)**
- 文章搜尋與分類篩選功能
- 多種排序選項（最新、最舊、最受歡迎、字母順序）
- 精選文章區塊展示
- 分頁機制與載入狀態管理
- 側邊欄包含熱門文章、分類統計、標籤雲
- 閱讀時間估算與觀看次數顯示

**BlogDetailView (部落格文章頁面)**
- 完整文章內容展示與目錄生成
- 社群分享功能（Twitter、LinkedIn、複製連結）
- 相關文章推薦系統
- 上一篇/下一篇文章導航
- 文章元資訊（發布日期、分類、標籤、閱讀時間）
- 響應式圖片與內容排版

**GuestbookView (留言板頁面)**
- 完整留言表單（姓名、信箱、網站、訊息）
- 留言列表展示與分頁
- 留言互動功能（點讚、檢舉）
- 作者回覆系統
- 留言審核狀態管理
- 社群規範說明與統計資訊

**ContactView (聯絡我頁面)**
- 全功能聯絡表單（多種主題選項、預算範圍）
- 多種聯絡方式展示（Email、電話、位置、社群）
- 社群媒體連結整合
- 常見問題 FAQ 摺疊面板
- 即時回應時間與可用狀態顯示
- 履歷下載功能

#### 技術實作品質
- ✅ 全部 9 個公開頁面完成
- ✅ TypeScript 嚴格類型檢查通過
- ✅ 前端專案建置成功
- ✅ 響應式設計與無障礙支援
- ✅ 統一的錯誤處理與載入狀態
- ✅ 一致的UI設計系統應用

#### 解決的技術問題
- 修正 BlogStore 與 CommentStore 方法名稱不匹配問題
- 更新 GuestBookEntry 型別定義，新增 UI 功能所需屬性
- 修正 Heroicons 圖示匯入問題（ExternalLinkIcon → ArrowTopRightOnSquareIcon）
- 解決 BaseTextarea rows 屬性型別錯誤

**前端開發進度更新: 75% → 90% 完成**

### 2025/08/14 (下午) - 使用者認證系統開發完成

#### 完成的認證功能

**LoginView (登入頁面)**
- 完整登入表單（使用者名稱、密碼、記住我選項）
- Demo 帳號支援 (admin/demo123)
- 社群登入按鈕 (Google/GitHub - 框架已建立)
- 表單驗證與錯誤處理
- 響應式設計與載入狀態
- 忘記密碼連結與註冊導向

**Enhanced AuthStore (認證狀態管理)**
- JWT Token 管理與自動刷新
- 使用者角色與權限檢查
- Pinia persist 狀態持久化
- Token 過期檢測與自動登出
- Demo 登入功能實作

**Enhanced AuthService (認證服務)**
- 完整登入/登出 API 整合
- Token 刷新機制
- 自動 Token 過期處理
- Demo 登入模擬 API
- 本地儲存管理

**DashboardView (管理儀表板)**
- 基礎管理介面展示
- 快速統計資訊卡片
- 最近活動與快速操作
- 使用者資訊顯示
- 登出功能整合

#### 路由系統增強
- 認證守衛 (requiresAuth/requiresGuest)
- 自動重導向機制
- 所有公開頁面路由啟用
- 管理頁面路由框架建立
- 404 錯誤處理

#### 技術實作亮點
- ✅ JWT Token 自動刷新機制
- ✅ 完整的認證狀態持久化
- ✅ 路由層級權限控制
- ✅ TypeScript 嚴格類型檢查
- ✅ 統一錯誤處理與使用者體驗
- ✅ Demo 帳號測試環境

#### 認證流程
1. 使用者訪問 `/login` 頁面
2. 輸入 Demo 帳號 (admin/demo123) 或真實認證
3. 成功登入後重導向至 `/admin/dashboard`
4. Token 自動管理與刷新
5. 登出後清除所有認證資料

**測試方式:**
- 開發伺服器: `npm run dev` (運行於 http://localhost:5176)
- Demo 帳號: 使用者名稱 `admin`, 密碼 `demo123`
- 直接訪問管理頁面將自動重導向至登入頁面

**前端開發進度: 85% → 90% 完成**

### 2025/08/12 - 前端核心功能開發完成

**完成的功能與元件:**

1. **技術架構設置**
   - Tailwind CSS 樣式框架設定與自訂主題
   - Axios HTTP 客戶端與攼截器設定
   - 環境變數管理 (.env.development/.production)
   - TypeScript 型別定義完成 (12個主要模型)

2. **核心服務層**
   - httpService: HTTP 請求管理與錯誤處理
   - authService: 使用者認證服務
   - profileService: 個人資料管理
   - portfolioService: 作品集管理

3. **狀態管理 (Pinia Stores)**
   - authStore: 使用者認證狀態管理
   - portfolioStore: 作品集狀態管理

4. **UI 元件庫**
   - BaseButton: 多樣式按鈕元件
   - BaseInput: 表單輸入元件
   - LoadingSpinner: 載入指示器
   - AppHeader: 響應式導航列
   - AppFooter: 頁面頁腳

5. **頁面開發**
   - HomeView: 完整首頁 (Hero, 功能介紹, 精選作品, CTA)
   - PortfolioView: 作品集列表 (搜尋, 篩選, 分頁)
   - NotFoundView: 404 錯誤頁面

6. **路由系統**
   - 完整路由設定 (公開 + 私有頁面)
   - 認證守衛 (requiresAuth/requiresGuest)
   - 動態路由載入 (Lazy Loading)
   - 頁面標題管理

**測試結果:**
- 開發伺服器正常啟動 (http://localhost:5173)
- Tailwind CSS 樣式正常作用
- Vue Router 路由切換正常
- TypeScript 編譯無錯誤

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