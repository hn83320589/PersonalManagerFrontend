// SEO optimization utilities
export interface SEOMetaData {
  title: string
  description: string
  keywords?: string[]
  author?: string
  image?: string
  url?: string
  type?: string
  siteName?: string
  locale?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export class SEOManager {
  private baseTitle = 'Personal Manager'
  private baseSiteName = 'Personal Manager'
  private baseUrl = import.meta.env.VITE_APP_URL || 'https://personalmanager.app'

  constructor() {
    this.initializeBasicMeta()
  }

  private initializeBasicMeta(): void {
    // Add basic meta tags if they don't exist
    this.ensureMetaTag('charset', 'utf-8')
    this.ensureMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    this.ensureMetaTag('theme-color', '#3b82f6')
    this.ensureMetaTag('color-scheme', 'light dark')
    this.ensureMetaTag('robots', 'index, follow')
    this.ensureMetaTag('googlebot', 'index, follow, snippet, archive')
    
    // Add structured data
    this.addStructuredData()
  }

  private ensureMetaTag(name: string, content: string): void {
    const selector = name === 'charset' ? 
      `meta[${name}]` : 
      `meta[name="${name}"], meta[property="${name}"]`
    
    let meta = document.querySelector(selector) as HTMLMetaElement
    
    if (!meta) {
      meta = document.createElement('meta')
      if (name === 'charset') {
        meta.setAttribute('charset', content)
      } else {
        meta.setAttribute('name', name)
        meta.setAttribute('content', content)
      }
      document.head.appendChild(meta)
    } else {
      if (name !== 'charset') {
        meta.setAttribute('content', content)
      }
    }
  }

  updatePageMeta(meta: SEOMetaData): void {
    // Update title
    const title = meta.title ? `${meta.title} - ${this.baseTitle}` : this.baseTitle
    document.title = title

    // Update meta tags
    this.updateMetaTag('description', meta.description)
    
    if (meta.keywords?.length) {
      this.updateMetaTag('keywords', meta.keywords.join(', '))
    }
    
    if (meta.author) {
      this.updateMetaTag('author', meta.author)
    }

    // Update Open Graph tags
    this.updateMetaTag('og:title', meta.title || this.baseTitle)
    this.updateMetaTag('og:description', meta.description)
    this.updateMetaTag('og:type', meta.type || 'website')
    this.updateMetaTag('og:site_name', meta.siteName || this.baseSiteName)
    this.updateMetaTag('og:locale', meta.locale || 'zh_TW')
    
    if (meta.image) {
      this.updateMetaTag('og:image', this.resolveUrl(meta.image))
      this.updateMetaTag('og:image:alt', meta.title || this.baseTitle)
    }
    
    if (meta.url) {
      this.updateMetaTag('og:url', this.resolveUrl(meta.url))
    }

    if (meta.publishedTime) {
      this.updateMetaTag('article:published_time', meta.publishedTime)
    }

    if (meta.modifiedTime) {
      this.updateMetaTag('article:modified_time', meta.modifiedTime)
    }

    if (meta.section) {
      this.updateMetaTag('article:section', meta.section)
    }

    if (meta.tags?.length) {
      // Remove existing article:tag meta tags
      document.querySelectorAll('meta[property="article:tag"]').forEach(tag => tag.remove())
      
      // Add new tags
      meta.tags.forEach(tag => {
        this.addMetaTag('article:tag', tag)
      })
    }

    // Update Twitter Card tags
    this.updateMetaTag('twitter:card', 'summary_large_image')
    this.updateMetaTag('twitter:title', meta.title || this.baseTitle)
    this.updateMetaTag('twitter:description', meta.description)
    
    if (meta.image) {
      this.updateMetaTag('twitter:image', this.resolveUrl(meta.image))
    }

    // Update canonical URL
    this.updateCanonicalUrl(meta.url)
  }

  private updateMetaTag(property: string, content: string): void {
    const isOG = property.startsWith('og:') || property.startsWith('article:')
    const isTwitter = property.startsWith('twitter:')
    
    const selector = isOG || isTwitter ? 
      `meta[property="${property}"]` : 
      `meta[name="${property}"]`
    
    let meta = document.querySelector(selector) as HTMLMetaElement
    
    if (!meta) {
      this.addMetaTag(property, content)
    } else {
      meta.setAttribute('content', content)
    }
  }

  private addMetaTag(property: string, content: string): void {
    const meta = document.createElement('meta')
    const isOG = property.startsWith('og:') || property.startsWith('article:')
    const isTwitter = property.startsWith('twitter:')
    
    if (isOG || isTwitter) {
      meta.setAttribute('property', property)
    } else {
      meta.setAttribute('name', property)
    }
    
    meta.setAttribute('content', content)
    document.head.appendChild(meta)
  }

  private updateCanonicalUrl(url?: string): void {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    
    const canonicalUrl = url ? this.resolveUrl(url) : window.location.href
    canonical.setAttribute('href', canonicalUrl)
  }

  private resolveUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    if (url.startsWith('/')) {
      return `${this.baseUrl}${url}`
    }
    
    return `${this.baseUrl}/${url}`
  }

  private addStructuredData(): void {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": this.baseSiteName,
      "url": this.baseUrl,
      "description": "個人作品集與管理系統",
      "inLanguage": "zh-TW",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${this.baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    }

    let script = document.querySelector('script[type="application/ld+json"]')
    
    if (!script) {
      script = document.createElement('script')
      script.setAttribute('type', 'application/ld+json')
      document.head.appendChild(script)
    }
    
    script.textContent = JSON.stringify(structuredData)
  }

  addBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): void {
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": this.resolveUrl(item.url)
      }))
    }

    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify(breadcrumbSchema)
    document.head.appendChild(script)
  }

  addArticleSchema(article: {
    headline: string
    description: string
    author: string
    datePublished: string
    dateModified?: string
    image?: string
    url: string
  }): void {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.headline,
      "description": article.description,
      "author": {
        "@type": "Person",
        "name": article.author
      },
      "datePublished": article.datePublished,
      "dateModified": article.dateModified || article.datePublished,
      "publisher": {
        "@type": "Organization",
        "name": this.baseSiteName,
        "url": this.baseUrl
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": this.resolveUrl(article.url)
      }
    }

    if (article.image) {
      (articleSchema as any).image = {
        "@type": "ImageObject",
        "url": this.resolveUrl(article.image)
      }
    }

    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify(articleSchema)
    document.head.appendChild(script)
  }

  addPersonSchema(person: {
    name: string
    jobTitle: string
    description: string
    image?: string
    email?: string
    website?: string
    sameAs?: string[]
  }): void {
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": person.name,
      "jobTitle": person.jobTitle,
      "description": person.description,
      "url": person.website || this.baseUrl
    }

    if (person.image) {
      (personSchema as any).image = this.resolveUrl(person.image)
    }

    if (person.email) {
      (personSchema as any).email = person.email
    }

    if (person.sameAs?.length) {
      (personSchema as any).sameAs = person.sameAs
    }

    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify(personSchema)
    document.head.appendChild(script)
  }

  // Generate sitemap (for static generation)
  generateSitemap(routes: Array<{ path: string; lastmod?: string; priority?: number }>): string {
    const urls = routes.map(route => {
      const url = this.resolveUrl(route.path)
      const lastmod = route.lastmod || new Date().toISOString().split('T')[0]
      const priority = route.priority || 0.5
      
      return `
    <url>
      <loc>${url}</loc>
      <lastmod>${lastmod}</lastmod>
      <priority>${priority}</priority>
    </url>`
    }).join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`
  }

  // Generate robots.txt
  generateRobotsTxt(options: {
    allowAll?: boolean
    disallowPaths?: string[]
    sitemapUrl?: string
  } = {}): string {
    const { allowAll = true, disallowPaths = [], sitemapUrl } = options
    
    let robots = 'User-agent: *\n'
    
    if (allowAll) {
      robots += 'Allow: /\n'
    }
    
    if (disallowPaths.length) {
      disallowPaths.forEach(path => {
        robots += `Disallow: ${path}\n`
      })
    }
    
    if (sitemapUrl) {
      robots += `\nSitemap: ${this.resolveUrl(sitemapUrl)}`
    }
    
    return robots
  }
}

// SEO composable for Vue components
export function useSEO() {
  const seoManager = new SEOManager()

  const updateMeta = (meta: SEOMetaData) => {
    seoManager.updatePageMeta(meta)
  }

  const addBreadcrumbs = (breadcrumbs: Array<{ name: string; url: string }>) => {
    seoManager.addBreadcrumbSchema(breadcrumbs)
  }

  const addArticle = (article: any) => {
    seoManager.addArticleSchema(article)
  }

  const addPerson = (person: any) => {
    seoManager.addPersonSchema(person)
  }

  return {
    updateMeta,
    addBreadcrumbs,
    addArticle,
    addPerson,
  }
}