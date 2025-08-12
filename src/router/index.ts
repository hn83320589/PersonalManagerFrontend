import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import views
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '首頁' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: '關於我' }
    },
    // TODO: 待實作
    // {
    //   path: '/experience',
    //   name: 'experience',
    //   component: () => import('../views/ExperienceView.vue'),
    //   meta: { title: '學經歷' }
    // },
    // {
    //   path: '/skills',
    //   name: 'skills',
    //   component: () => import('../views/SkillsView.vue'),
    //   meta: { title: '技能專長' }
    // },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('../views/PortfolioView.vue'),
      meta: { title: '作品集' }
    },
    // TODO: 待實作
    // {
    //   path: '/portfolio/:id',
    //   name: 'portfolio-detail',
    //   component: () => import('../views/PortfolioDetailView.vue'),
    //   meta: { title: '作品詳情' }
    // },
    // {
    //   path: '/blog',
    //   name: 'blog',
    //   component: () => import('../views/BlogView.vue'),
    //   meta: { title: '部落格' }
    // },
    // {
    //   path: '/blog/:id',
    //   name: 'blog-detail',
    //   component: () => import('../views/BlogDetailView.vue'),
    //   meta: { title: '文章內容' }
    // },
    // {
    //   path: '/guestbook',
    //   name: 'guestbook',
    //   component: () => import('../views/GuestbookView.vue'),
    //   meta: { title: '留言板' }
    // },
    // {
    //   path: '/contact',
    //   name: 'contact',
    //   component: () => import('../views/ContactView.vue'),
    //   meta: { title: '聯絡我' }
    // },
    
    // TODO: Auth routes (待實作)
    // {
    //   path: '/login',
    //   name: 'login',
    //   component: () => import('../views/auth/LoginView.vue'),
    //   meta: { title: '登入', requiresGuest: true }
    // },
    
    // TODO: Protected routes (待實作)
    // {
    //   path: '/dashboard',
    //   name: 'dashboard',
    //   component: () => import('../views/admin/DashboardView.vue'),
    //   meta: { title: '管理儀表板', requiresAuth: true }
    // },
    // {
    //   path: '/profile',
    //   name: 'profile-manage',
    //   component: () => import('../views/admin/ProfileManageView.vue'),
    //   meta: { title: '個人資料管理', requiresAuth: true }
    // },
    // {
    //   path: '/admin/portfolio',
    //   name: 'admin-portfolio',
    //   component: () => import('../views/admin/PortfolioManageView.vue'),
    //   meta: { title: '作品管理', requiresAuth: true }
    // },
    // {
    //   path: '/admin/blog',
    //   name: 'admin-blog',
    //   component: () => import('../views/admin/BlogManageView.vue'),
    //   meta: { title: '文章管理', requiresAuth: true }
    // },
    // {
    //   path: '/admin/tasks',
    //   name: 'admin-tasks',
    //   component: () => import('../views/admin/TaskManageView.vue'),
    //   meta: { title: '待辦事項', requiresAuth: true }
    // },
    // {
    //   path: '/admin/calendar',
    //   name: 'admin-calendar',
    //   component: () => import('../views/admin/CalendarManageView.vue'),
    //   meta: { title: '行事曆管理', requiresAuth: true }
    // },
    
    // Catch all 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: '頁面不存在' }
    }
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state
  authStore.initializeAuth()
  
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || 'Personal Manager'}`
  }
  
  // Check auth requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect to dashboard if already authenticated
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

export default router