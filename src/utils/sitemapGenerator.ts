/**
 * Sitemap 生成器
 * 用於動態生成網站地圖
 */

export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  images?: Array<{
    loc: string
    caption?: string
    title?: string
  }>
}

export interface SitemapIndex {
  loc: string
  lastmod?: string
}

export class SitemapGenerator {
  private baseUrl: string

  constructor(baseUrl: string = 'https://personalmanager.app') {
    this.baseUrl = baseUrl.replace(/\/$/, '') // 移除結尾斜槓
  }

  /**
   * 生成主要 sitemap.xml
   */
  generateMainSitemap(urls: SitemapUrl[]): string {
    const urlEntries = urls.map(url => this.formatSitemapUrl(url)).join('\n  ')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${urlEntries}
</urlset>`
  }

  /**
   * 生成 sitemap index
   */
  generateSitemapIndex(sitemaps: SitemapIndex[]): string {
    const sitemapEntries = sitemaps.map(sitemap => `
    <sitemap>
      <loc>${this.resolveUrl(sitemap.loc)}</loc>
      ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : ''}
    </sitemap>`).join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries}
</sitemapindex>`
  }

  /**
   * 生成靜態頁面 sitemap
   */
  generateStaticSitemap(): string {
    const staticPages: SitemapUrl[] = [
      {
        loc: '/',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: '/about',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.9
      },
      {
        loc: '/experience',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        loc: '/skills',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        loc: '/portfolio',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        loc: '/calendar',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 0.7
      },
      {
        loc: '/blog',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 0.9
      },
      {
        loc: '/guestbook',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.6
      },
      {
        loc: '/contact',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.7
      }
    ]

    return this.generateMainSitemap(staticPages)
  }

  /**
   * 生成部落格文章 sitemap
   */
  generateBlogSitemap(posts: Array<{
    slug: string
    updatedAt: string
    images?: string[]
    title?: string
  }>): string {
    const blogUrls: SitemapUrl[] = posts.map(post => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updatedAt.split('T')[0],
      changefreq: 'monthly',
      priority: 0.8,
      images: post.images?.map(img => ({
        loc: img,
        caption: post.title,
        title: post.title
      }))
    }))

    return this.generateMainSitemap(blogUrls)
  }

  /**
   * 生成作品集 sitemap
   */
  generatePortfolioSitemap(projects: Array<{
    id: string | number
    updatedAt: string
    images?: string[]
    title?: string
  }>): string {
    const portfolioUrls: SitemapUrl[] = projects.map(project => ({
      loc: `/portfolio/${project.id}`,
      lastmod: project.updatedAt.split('T')[0],
      changefreq: 'monthly',
      priority: 0.7,
      images: project.images?.map(img => ({
        loc: img,
        caption: project.title,
        title: project.title
      }))
    }))

    return this.generateMainSitemap(portfolioUrls)
  }

  /**
   * 格式化單個 URL 條目
   */
  private formatSitemapUrl(url: SitemapUrl): string {
    const imageEntries = url.images?.map(image => `
      <image:image>
        <image:loc>${this.resolveUrl(image.loc)}</image:loc>
        ${image.caption ? `<image:caption>${this.escapeXml(image.caption)}</image:caption>` : ''}
        ${image.title ? `<image:title>${this.escapeXml(image.title)}</image:title>` : ''}
      </image:image>`).join('') || ''

    return `<url>
    <loc>${this.resolveUrl(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}${imageEntries}
  </url>`
  }

  /**
   * 解析完整 URL
   */
  private resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`
  }

  /**
   * XML 轉義
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }
}

/**
 * News sitemap 生成器（適用於新聞或部落格）
 */
export class NewsSitemapGenerator {
  private baseUrl: string

  constructor(baseUrl: string = 'https://personalmanager.app') {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  generateNewsSitemap(articles: Array<{
    slug: string
    title: string
    publishedAt: string
    language?: string
    keywords?: string[]
    genre?: string
  }>): string {
    // 只包含最近 2 天的文章（Google News 要求）
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const recentArticles = articles.filter(article => 
      new Date(article.publishedAt) >= twoDaysAgo
    )

    const urlEntries = recentArticles.map(article => `
  <url>
    <loc>${this.baseUrl}/blog/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Personal Manager Blog</news:name>
        <news:language>${article.language || 'zh-tw'}</news:language>
      </news:publication>
      <news:publication_date>${article.publishedAt}</news:publication_date>
      <news:title>${this.escapeXml(article.title)}</news:title>
      ${article.keywords ? `<news:keywords>${article.keywords.join(', ')}</news:keywords>` : ''}
      ${article.genre ? `<news:genres>${article.genre}</news:genres>` : ''}
    </news:news>
  </url>`).join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${urlEntries}
</urlset>`
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }
}

/**
 * 動態 sitemap 服務
 */
export class DynamicSitemapService {
  private generator: SitemapGenerator
  private newsGenerator: NewsSitemapGenerator

  constructor(baseUrl?: string) {
    this.generator = new SitemapGenerator(baseUrl)
    this.newsGenerator = new NewsSitemapGenerator(baseUrl)
  }

  /**
   * 生成完整的 sitemap 結構
   */
  async generateFullSitemap(data?: {
    posts?: any[]
    projects?: any[]
  }): Promise<{
    index: string
    static: string
    blog?: string
    portfolio?: string
    news?: string
  }> {
    const sitemaps: SitemapIndex[] = [
      {
        loc: '/sitemap-static.xml',
        lastmod: new Date().toISOString().split('T')[0]
      }
    ]

    const result: any = {
      static: this.generator.generateStaticSitemap()
    }

    // 生成部落格 sitemap
    if (data?.posts?.length) {
      result.blog = this.generator.generateBlogSitemap(data.posts)
      result.news = this.newsGenerator.generateNewsSitemap(data.posts)
      sitemaps.push({
        loc: '/sitemap-blog.xml',
        lastmod: new Date().toISOString().split('T')[0]
      })
      sitemaps.push({
        loc: '/sitemap-news.xml',
        lastmod: new Date().toISOString().split('T')[0]
      })
    }

    // 生成作品集 sitemap
    if (data?.projects?.length) {
      result.portfolio = this.generator.generatePortfolioSitemap(data.projects)
      sitemaps.push({
        loc: '/sitemap-portfolio.xml',
        lastmod: new Date().toISOString().split('T')[0]
      })
    }

    result.index = this.generator.generateSitemapIndex(sitemaps)

    return result
  }

  /**
   * 獲取所有 URL 用於預渲染
   */
  getAllUrls(data?: {
    posts?: Array<{ slug: string }>
    projects?: Array<{ id: string | number }>
  }): string[] {
    const urls = [
      '/',
      '/about',
      '/experience',
      '/skills',
      '/portfolio',
      '/calendar',
      '/blog',
      '/guestbook',
      '/contact'
    ]

    if (data?.posts) {
      urls.push(...data.posts.map(post => `/blog/${post.slug}`))
    }

    if (data?.projects) {
      urls.push(...data.projects.map(project => `/portfolio/${project.id}`))
    }

    return urls
  }
}

// 預設匯出
export const sitemapGenerator = new SitemapGenerator()
export const dynamicSitemapService = new DynamicSitemapService()