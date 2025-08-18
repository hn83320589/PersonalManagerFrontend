// Image optimization utilities
export interface ImageOptimizationOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  format?: 'webp' | 'jpeg' | 'png'
  progressive?: boolean
}

export class ImageOptimizer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
  }

  async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<Blob> {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'webp',
      progressive = true
    } = options

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // Calculate new dimensions
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          )

          // Set canvas size
          this.canvas.width = width
          this.canvas.height = height

          // Clear canvas and draw image
          this.ctx.clearRect(0, 0, width, height)
          this.ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob
          this.canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to optimize image'))
              }
            },
            this.getMimeType(format),
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    // Calculate aspect ratio
    const aspectRatio = width / height

    // Resize based on max dimensions
    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }

    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    return { width: Math.round(width), height: Math.round(height) }
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'webp':
        return 'image/webp'
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
        return 'image/png'
      default:
        return 'image/webp'
    }
  }

  async generateThumbnail(
    file: File,
    size: number = 150
  ): Promise<Blob> {
    return this.optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'webp'
    })
  }

  async generateMultipleSizes(
    file: File,
    sizes: number[] = [480, 768, 1024, 1920]
  ): Promise<Array<{ size: number; blob: Blob }>> {
    const results = await Promise.all(
      sizes.map(async (size) => {
        const blob = await this.optimizeImage(file, {
          maxWidth: size,
          maxHeight: size,
          quality: 0.8,
          format: 'webp'
        })
        return { size, blob }
      })
    )

    return results
  }

  supportsWebP(): boolean {
    return this.canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  supportsAVIF(): boolean {
    return this.canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  }
}

// Responsive image source generator
export class ResponsiveImageManager {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  generateSrcSet(
    imagePath: string,
    sizes: number[] = [480, 768, 1024, 1920]
  ): string {
    return sizes
      .map(size => `${this.baseUrl}${imagePath}?w=${size} ${size}w`)
      .join(', ')
  }

  generateSizes(breakpoints: Array<{ maxWidth: string; imageWidth: string }>): string {
    const sizeEntries = breakpoints.map(
      bp => `(max-width: ${bp.maxWidth}) ${bp.imageWidth}`
    )
    
    // Add default size
    sizeEntries.push('100vw')
    
    return sizeEntries.join(', ')
  }

  generatePictureElement(
    imagePath: string,
    alt: string,
    options: {
      sizes?: number[]
      breakpoints?: Array<{ maxWidth: string; imageWidth: string }>
      fallbackFormat?: string
    } = {}
  ): string {
    const {
      sizes = [480, 768, 1024, 1920],
      breakpoints = [
        { maxWidth: '480px', imageWidth: '480px' },
        { maxWidth: '768px', imageWidth: '768px' },
        { maxWidth: '1024px', imageWidth: '1024px' }
      ],
      fallbackFormat = 'jpeg'
    } = options

    const webpSrcSet = this.generateSrcSet(imagePath.replace(/\.(jpg|jpeg|png)$/, '.webp'), sizes)
    const fallbackSrcSet = this.generateSrcSet(imagePath, sizes)
    const sizesAttr = this.generateSizes(breakpoints)

    return `
      <picture>
        <source 
          srcset="${webpSrcSet}" 
          sizes="${sizesAttr}" 
          type="image/webp"
        />
        <img 
          src="${this.baseUrl}${imagePath}" 
          srcset="${fallbackSrcSet}" 
          sizes="${sizesAttr}" 
          alt="${alt}"
          loading="lazy"
          decoding="async"
        />
      </picture>
    `.trim()
  }
}

// Image preloading manager
export class ImagePreloader {
  private preloadedImages = new Set<string>()

  async preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.preloadedImages.has(src)) {
      return Promise.resolve(new Image())
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        this.preloadedImages.add(src)
        resolve(img)
      }
      
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`))
      }
      
      img.src = src
    })
  }

  async preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
    const promises = sources.map(src => this.preloadImage(src))
    return Promise.all(promises)
  }

  preloadCriticalImages(selector: string = 'img[data-critical]'): void {
    const criticalImages = document.querySelectorAll(selector) as NodeListOf<HTMLImageElement>
    
    criticalImages.forEach(img => {
      const src = img.dataset.src || img.src
      if (src) {
        this.preloadImage(src).catch(console.error)
      }
    })
  }

  isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src)
  }

  clear(): void {
    this.preloadedImages.clear()
  }
}

// Progressive image loading
export class ProgressiveImageLoader {
  private observer: IntersectionObserver | null = null

  constructor() {
    this.setupIntersectionObserver()
  }

  private setupIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadProgressiveImage(entry.target as HTMLImageElement)
              this.observer?.unobserve(entry.target)
            }
          })
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      )
    }
  }

  private async loadProgressiveImage(img: HTMLImageElement): Promise<void> {
    const lowResSrc = img.dataset.lowRes
    const highResSrc = img.dataset.highRes || img.dataset.src

    if (!highResSrc) return

    try {
      // Load low-res placeholder first
      if (lowResSrc && img.src !== lowResSrc) {
        img.src = lowResSrc
        img.style.filter = 'blur(5px)'
      }

      // Load high-res image
      const highResImg = new Image()
      await new Promise<void>((resolve, reject) => {
        highResImg.onload = () => resolve()
        highResImg.onerror = () => reject()
        highResImg.src = highResSrc
      })

      // Switch to high-res image
      img.src = highResSrc
      img.style.filter = 'none'
      img.style.transition = 'filter 0.3s ease-in-out'
      
      // Clean up data attributes
      delete img.dataset.lowRes
      delete img.dataset.highRes
      delete img.dataset.src

    } catch (error) {
      console.error('Failed to load progressive image:', error)
      
      // Fallback to original src if available
      if (img.dataset.fallback) {
        img.src = img.dataset.fallback
        img.style.filter = 'none'
      }
    }
  }

  observe(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.observe(img)
    } else {
      // Fallback: load immediately
      this.loadProgressiveImage(img)
    }
  }

  observeAll(selector: string = 'img[data-src], img[data-high-res]'): void {
    const images = document.querySelectorAll(selector) as NodeListOf<HTMLImageElement>
    images.forEach(img => this.observe(img))
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// WebP detection and fallback
export function detectWebPSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

// Image format helper
export function getOptimalImageFormat(
  originalFormat: string,
  supportsWebP: boolean,
  supportsAVIF: boolean
): string {
  if (supportsAVIF) {
    return 'avif'
  }
  
  if (supportsWebP) {
    return 'webp'
  }
  
  return originalFormat
}