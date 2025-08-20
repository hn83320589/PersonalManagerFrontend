import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { SEOManager, type SEOMetaData } from '@/utils/seo'

interface PageSEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
  nofollow?: boolean
}

/**
 * SEO 管理 Composable
 */
export function useSEO(config?: PageSEOConfig) {
  const route = useRoute()
  const seoManager = new SEOManager()

  // 更新頁面 meta 資訊
  const updatePageMeta = (meta: Partial<PageSEOConfig>) => {
    const seoData: SEOMetaData = {
      title: meta.title || config?.title || '',
      description: meta.description || config?.description || '',
      keywords: meta.keywords || config?.keywords,
      image: meta.image || config?.image,
      type: meta.type || config?.type || 'website',
      author: meta.author || config?.author,
      publishedTime: meta.publishedTime || config?.publishedTime,
      modifiedTime: meta.modifiedTime || config?.modifiedTime,
      url: route.fullPath,
      locale: 'zh-TW',
      siteName: 'Personal Manager'
    }

    seoManager.updatePageMeta(seoData)

    // 處理 robots meta
    if (config?.noindex || config?.nofollow) {
      const robotsContent = [
        config.noindex ? 'noindex' : 'index',
        config.nofollow ? 'nofollow' : 'follow'
      ].join(', ')
      
      updateMetaTag('robots', robotsContent)
    }
  }

  // 更新單個 meta 標籤
  const updateMetaTag = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
    
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', name)
      document.head.appendChild(meta)
    }
    
    meta.setAttribute('content', content)
  }

  // 添加麵包屑導航
  const addBreadcrumbs = (breadcrumbs: Array<{ name: string; url: string }>) => {
    seoManager.addBreadcrumbSchema(breadcrumbs)
  }

  // 添加文章結構化資料
  const addArticleSchema = (article: {
    headline: string
    description: string
    author: string
    datePublished: string
    dateModified?: string
    image?: string
    tags?: string[]
  }) => {
    seoManager.addArticleSchema({
      ...article,
      url: route.fullPath
    })
  }

  // 添加個人資料結構化資料
  const addPersonSchema = (person: {
    name: string
    jobTitle: string
    description: string
    image?: string
    email?: string
    website?: string
    sameAs?: string[]
  }) => {
    seoManager.addPersonSchema(person)
  }

  // 添加組織結構化資料
  const addOrganizationSchema = (organization: {
    name: string
    description: string
    url: string
    logo?: string
    contactPoint?: {
      telephone?: string
      contactType?: string
      email?: string
    }
    sameAs?: string[]
  }) => {
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": organization.name,
      "description": organization.description,
      "url": organization.url
    }

    if (organization.logo) {
      (orgSchema as any).logo = {
        "@type": "ImageObject",
        "url": organization.logo
      }
    }

    if (organization.contactPoint) {
      (orgSchema as any).contactPoint = {
        "@type": "ContactPoint",
        ...organization.contactPoint
      }
    }

    if (organization.sameAs) {
      (orgSchema as any).sameAs = organization.sameAs
    }

    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify(orgSchema)
    document.head.appendChild(script)
  }

  // 添加作品集結構化資料
  const addPortfolioSchema = (portfolio: {
    name: string
    description: string
    url: string
    image?: string
    author: string
    dateCreated: string
    skills?: string[]
    category?: string
  }) => {
    const portfolioSchema = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": portfolio.name,
      "description": portfolio.description,
      "url": portfolio.url,
      "dateCreated": portfolio.dateCreated,
      "creator": {
        "@type": "Person",
        "name": portfolio.author
      }
    }

    if (portfolio.image) {
      (portfolioSchema as any).image = {
        "@type": "ImageObject",
        "url": portfolio.image
      }
    }

    if (portfolio.skills) {
      (portfolioSchema as any).keywords = portfolio.skills.join(', ')
    }

    if (portfolio.category) {
      (portfolioSchema as any).genre = portfolio.category
    }

    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify(portfolioSchema)
    document.head.appendChild(script)
  }

  // 設定社群媒體標籤
  const setSocialMediaTags = (social: {
    facebook?: {
      appId?: string
      admins?: string
    }
    twitter?: {
      site?: string
      creator?: string
    }
  }) => {
    if (social.facebook?.appId) {
      updateMetaTag('fb:app_id', social.facebook.appId)
    }

    if (social.facebook?.admins) {
      updateMetaTag('fb:admins', social.facebook.admins)
    }

    if (social.twitter?.site) {
      updateMetaTag('twitter:site', social.twitter.site)
    }

    if (social.twitter?.creator) {
      updateMetaTag('twitter:creator', social.twitter.creator)
    }
  }

  // 設定 hreflang 標籤
  const setHreflangTags = (languages: Array<{ lang: string; url: string }>) => {
    // 移除現有的 hreflang 標籤
    document.querySelectorAll('link[hreflang]').forEach(link => link.remove())

    languages.forEach(({ lang, url }) => {
      const link = document.createElement('link')
      link.setAttribute('rel', 'alternate')
      link.setAttribute('hreflang', lang)
      link.setAttribute('href', url)
      document.head.appendChild(link)
    })
  }

  // 設定預載入資源
  const preloadResources = (resources: Array<{
    href: string
    as: 'style' | 'script' | 'image' | 'font'
    type?: string
    crossorigin?: boolean
  }>) => {
    resources.forEach(resource => {
      const link = document.createElement('link')
      link.setAttribute('rel', 'preload')
      link.setAttribute('href', resource.href)
      link.setAttribute('as', resource.as)
      
      if (resource.type) {
        link.setAttribute('type', resource.type)
      }
      
      if (resource.crossorigin) {
        link.setAttribute('crossorigin', 'anonymous')
      }
      
      document.head.appendChild(link)
    })
  }

  // 清理結構化資料
  const cleanupStructuredData = () => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    scripts.forEach(script => {
      // 只清理非基礎的結構化資料
      if (script.textContent && !script.textContent.includes('"@type":"WebSite"')) {
        script.remove()
      }
    })
  }

  // 初始化
  onMounted(() => {
    if (config) {
      updatePageMeta(config)
    }
  })

  // 路由變化時清理
  watch(
    () => route.fullPath,
    () => {
      cleanupStructuredData()
    }
  )

  // 組件卸載時清理
  onUnmounted(() => {
    cleanupStructuredData()
  })

  return {
    updatePageMeta,
    updateMetaTag,
    addBreadcrumbs,
    addArticleSchema,
    addPersonSchema,
    addOrganizationSchema,
    addPortfolioSchema,
    setSocialMediaTags,
    setHreflangTags,
    preloadResources,
    cleanupStructuredData
  }
}

/**
 * Open Graph 圖片優化 Composable
 */
export function useOGImageGeneration() {
  const generateOGImage = (config: {
    title: string
    subtitle?: string
    background?: string
    logo?: string
    author?: {
      name: string
      avatar?: string
    }
  }): string => {
    // 這裡可以整合第三方 OG 圖片生成服務
    // 例如：Vercel OG, Bannerbear, 或自建服務
    const params = new URLSearchParams({
      title: config.title,
      subtitle: config.subtitle || '',
      background: config.background || '',
      logo: config.logo || '',
      author: config.author?.name || '',
      avatar: config.author?.avatar || ''
    })

    return `/api/og-image?${params.toString()}`
  }

  return {
    generateOGImage
  }
}

/**
 * 網站效能監控 Composable（SEO 相關）
 */
export function useSEOPerformance() {
  const measureCoreWebVitals = () => {
    const metrics = {
      fcp: 0,  // First Contentful Paint
      lcp: 0,  // Largest Contentful Paint
      fid: 0,  // First Input Delay
      cls: 0,  // Cumulative Layout Shift
      ttfb: 0  // Time to First Byte
    }

    // FCP
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime
        }
      }
    })
    observer.observe({ entryTypes: ['paint'] })

    // LCP
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      metrics.lcp = lastEntry.startTime
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // FID
    const fidObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        metrics.fid = (entry as any).processingStart - entry.startTime
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // CLS
    let clsValue = 0
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      metrics.cls = clsValue
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    return metrics
  }

  const reportToGoogleAnalytics = (metrics: any) => {
    // 發送 Core Web Vitals 到 Google Analytics
    if (window.gtag) {
      Object.entries(metrics).forEach(([metric, value]) => {
        window.gtag('event', metric, {
          event_category: 'Web Vitals',
          value: Math.round(value as number),
          non_interaction: true
        })
      })
    }
  }

  return {
    measureCoreWebVitals,
    reportToGoogleAnalytics
  }
}