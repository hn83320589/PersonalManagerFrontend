// Bundle analysis and optimization utilities
export interface BundleAnalysis {
  totalSize: number
  jsSize: number
  cssSize: number
  assetSize: number
  chunkCount: number
  chunks: ChunkInfo[]
  recommendations: string[]
}

export interface ChunkInfo {
  name: string
  size: number
  type: 'js' | 'css' | 'asset'
  url: string
  loadTime?: number
}

export class BundleAnalyzer {
  private performanceObserver: PerformanceObserver | null = null
  private resourceTimings: Map<string, PerformanceResourceTiming> = new Map()

  constructor() {
    this.setupPerformanceObserver()
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceTiming = entry as PerformanceResourceTiming
            this.resourceTimings.set(resourceTiming.name, resourceTiming)
          }
        }
      })

      this.performanceObserver.observe({ entryTypes: ['resource'] })
    }
  }

  async analyzeBundleSize(): Promise<BundleAnalysis> {
    const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[]
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[]
    const images = Array.from(document.querySelectorAll('img[src]')) as HTMLImageElement[]
    const otherAssets = Array.from(document.querySelectorAll('link[href]:not([rel="stylesheet"])'))

    const chunks: ChunkInfo[] = []
    let totalSize = 0
    let jsSize = 0
    let cssSize = 0
    let assetSize = 0

    // Analyze JavaScript files
    for (const script of scripts) {
      if (script.src) {
        const size = await this.getResourceSize(script.src)
        const timing = this.resourceTimings.get(script.src)
        
        chunks.push({
          name: this.getFileName(script.src),
          size,
          type: 'js',
          url: script.src,
          loadTime: timing ? timing.responseEnd - timing.requestStart : undefined
        })
        
        jsSize += size
        totalSize += size
      }
    }

    // Analyze CSS files
    for (const stylesheet of stylesheets) {
      if (stylesheet.href) {
        const size = await this.getResourceSize(stylesheet.href)
        const timing = this.resourceTimings.get(stylesheet.href)
        
        chunks.push({
          name: this.getFileName(stylesheet.href),
          size,
          type: 'css',
          url: stylesheet.href,
          loadTime: timing ? timing.responseEnd - timing.requestStart : undefined
        })
        
        cssSize += size
        totalSize += size
      }
    }

    // Analyze image assets
    for (const image of images) {
      if (image.src && !image.src.startsWith('data:')) {
        const size = await this.getResourceSize(image.src)
        
        chunks.push({
          name: this.getFileName(image.src),
          size,
          type: 'asset',
          url: image.src
        })
        
        assetSize += size
        totalSize += size
      }
    }

    const recommendations = this.generateRecommendations({
      totalSize,
      jsSize,
      cssSize,
      assetSize,
      chunkCount: chunks.length,
      chunks,
      recommendations: []
    })

    return {
      totalSize,
      jsSize,
      cssSize,
      assetSize,
      chunkCount: chunks.length,
      chunks: chunks.sort((a, b) => b.size - a.size),
      recommendations
    }
  }

  private async getResourceSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      const contentLength = response.headers.get('content-length')
      return contentLength ? parseInt(contentLength, 10) : 0
    } catch (error) {
      console.warn(`Failed to get size for ${url}:`, error)
      return 0
    }
  }

  private getFileName(url: string): string {
    return url.split('/').pop() || url
  }

  private generateRecommendations(analysis: BundleAnalysis): string[] {
    const recommendations: string[] = []

    // Check total bundle size
    if (analysis.totalSize > 2 * 1024 * 1024) { // 2MB
      recommendations.push('Total bundle size is large (>2MB). Consider code splitting and lazy loading.')
    }

    // Check JavaScript size
    if (analysis.jsSize > 1 * 1024 * 1024) { // 1MB
      recommendations.push('JavaScript bundle is large (>1MB). Consider splitting vendor libraries.')
    }

    // Check number of chunks
    if (analysis.chunkCount > 20) {
      recommendations.push('Too many chunks may cause HTTP/1.1 connection issues. Consider bundling some chunks.')
    }

    // Check for large individual chunks
    const largeChunks = analysis.chunks.filter(chunk => chunk.size > 500 * 1024) // 500KB
    if (largeChunks.length > 0) {
      recommendations.push(`Large chunks detected: ${largeChunks.map(c => c.name).join(', ')}. Consider splitting these.`)
    }

    // Check for slow loading chunks
    const slowChunks = analysis.chunks.filter(chunk => chunk.loadTime && chunk.loadTime > 2000) // 2s
    if (slowChunks.length > 0) {
      recommendations.push(`Slow loading chunks detected: ${slowChunks.map(c => c.name).join(', ')}. Check network or server performance.`)
    }

    // Check for unoptimized images
    const largeImages = analysis.chunks.filter(
      chunk => chunk.type === 'asset' && chunk.size > 100 * 1024 // 100KB
    )
    if (largeImages.length > 0) {
      recommendations.push('Large images detected. Consider image optimization and WebP format.')
    }

    // Check for unused CSS
    if (analysis.cssSize > 200 * 1024) { // 200KB
      recommendations.push('CSS bundle is large. Consider removing unused styles and using PurgeCSS.')
    }

    return recommendations
  }

  generateReport(analysis: BundleAnalysis): string {
    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const formatLoadTime = (ms?: number) => {
      if (!ms) return 'N/A'
      return `${ms.toFixed(0)}ms`
    }

    let report = `
📊 Bundle Analysis Report
========================

📦 Total Size: ${formatSize(analysis.totalSize)}
🟨 JavaScript: ${formatSize(analysis.jsSize)} (${((analysis.jsSize / analysis.totalSize) * 100).toFixed(1)}%)
🎨 CSS: ${formatSize(analysis.cssSize)} (${((analysis.cssSize / analysis.totalSize) * 100).toFixed(1)}%)
🖼️  Assets: ${formatSize(analysis.assetSize)} (${((analysis.assetSize / analysis.totalSize) * 100).toFixed(1)}%)
📄 Chunks: ${analysis.chunkCount}

🔍 Largest Chunks:
${analysis.chunks.slice(0, 10).map((chunk, i) => 
  `${i + 1}. ${chunk.name} (${chunk.type.toUpperCase()}) - ${formatSize(chunk.size)} - Load: ${formatLoadTime(chunk.loadTime)}`
).join('\n')}
`

    if (analysis.recommendations.length > 0) {
      report += `\n💡 Recommendations:\n${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}`
    }

    return report
  }

  logAnalysis(): void {
    this.analyzeBundleSize().then(analysis => {
      console.group('📊 Bundle Analysis')
      console.log(this.generateReport(analysis))
      console.table(analysis.chunks)
      console.groupEnd()
    })
  }

  disconnect(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }
  }
}

// Webpack Bundle Analyzer integration for development
export class WebpackAnalyzer {
  static async analyzeWebpackStats(statsUrl: string = '/stats.json'): Promise<any> {
    try {
      const response = await fetch(statsUrl)
      const stats = await response.json()
      
      return this.processWebpackStats(stats)
    } catch (error) {
      console.warn('Webpack stats not available:', error)
      return null
    }
  }

  private static processWebpackStats(stats: any) {
    const analysis = {
      entrypoints: {},
      chunks: [],
      modules: [],
      assets: []
    }

    // Process chunks
    if (stats.chunks) {
      analysis.chunks = stats.chunks.map((chunk: any) => ({
        id: chunk.id,
        names: chunk.names,
        size: chunk.size,
        modules: chunk.modules?.length || 0,
        files: chunk.files
      }))
    }

    // Process modules
    if (stats.modules) {
      analysis.modules = stats.modules.map((module: any) => ({
        id: module.id,
        name: module.name,
        size: module.size,
        chunks: module.chunks
      })).sort((a: any, b: any) => b.size - a.size)
    }

    // Process assets
    if (stats.assets) {
      analysis.assets = stats.assets.map((asset: any) => ({
        name: asset.name,
        size: asset.size,
        chunks: asset.chunks,
        emitted: asset.emitted
      })).sort((a: any, b: any) => b.size - a.size)
    }

    return analysis
  }

  static logWebpackAnalysis(analysis: any): void {
    if (!analysis) return

    console.group('📦 Webpack Bundle Analysis')
    
    if (analysis.chunks.length > 0) {
      console.log('🧩 Chunks:')
      console.table(analysis.chunks.slice(0, 10))
    }
    
    if (analysis.modules.length > 0) {
      console.log('📄 Largest Modules:')
      console.table(analysis.modules.slice(0, 15))
    }
    
    if (analysis.assets.length > 0) {
      console.log('💾 Assets:')
      console.table(analysis.assets.slice(0, 10))
    }
    
    console.groupEnd()
  }
}

// Code splitting analyzer
export class CodeSplittingAnalyzer {
  static analyzeRouteChunks(): void {
    const chunks = new Map<string, { size: number; loadTime: number }>()
    
    // Monitor dynamic imports
    const originalImport = (window as any).__webpack_require__ || (window as any).import
    
    if (typeof originalImport === 'function') {
      // This would require webpack integration
      console.log('Code splitting analysis requires webpack integration')
    }
  }

  static async measureChunkLoadTime(chunkPath: string): Promise<number> {
    const startTime = performance.now()
    
    try {
      await import(chunkPath)
      return performance.now() - startTime
    } catch (error) {
      console.error(`Failed to load chunk ${chunkPath}:`, error)
      return -1
    }
  }

  static getRecommendations(): string[] {
    return [
      'Split vendor libraries from application code',
      'Use dynamic imports for route-based code splitting',
      'Implement lazy loading for non-critical components',
      'Consider splitting large libraries into separate chunks',
      'Use webpack-bundle-analyzer for detailed analysis',
      'Implement preloading for critical chunks',
      'Use tree shaking to eliminate dead code'
    ]
  }
}