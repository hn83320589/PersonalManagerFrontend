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
    {
      path: '/experience',
      name: 'experience',
      component: () => import('../views/ExperienceView.vue'),
      meta: { title: '學經歷' }
    },
    {
      path: '/skills',
      name: 'skills',
      component: () => import('../views/SkillView.vue'),
      meta: { title: '技能專長' }
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('../views/PortfolioView.vue'),
      meta: { title: '作品集' }
    },
    {
      path: '/portfolio/:id',
      name: 'portfolio-detail',
      component: () => import('../views/ProjectDetailView.vue'),
      meta: { title: '作品詳情' }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../views/PublicCalendarView.vue'),
      meta: { title: '公開行事曆' }
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/BlogListView.vue'),
      meta: { title: '部落格' }
    },
    {
      path: '/blog/:slug',
      name: 'blog-detail',
      component: () => import('../views/BlogDetailView.vue'),
      meta: { title: '文章內容' }
    },
    {
      path: '/guestbook',
      name: 'guestbook',
      component: () => import('../views/GuestbookView.vue'),
      meta: { title: '留言板' }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: { title: '聯絡我' }
    },
    
    // Auth routes
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: '登入', requiresGuest: true }
    },
    
    // Protected routes (Admin)
    {
      path: '/admin',
      redirect: '/admin/dashboard'
    },
    {
      path: '/admin/dashboard',
      name: 'dashboard',
      component: () => import('../views/admin/DashboardView.vue'),
      meta: { title: '管理儀表板', requiresAuth: true }
    },
    
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