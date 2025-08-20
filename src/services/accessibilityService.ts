/**
 * 無障礙服務
 * 提供無障礙功能的統一管理和 API 整合
 */

import type { AccessibilityReport } from '@/utils/accessibilityTester'

export interface AccessibilityPreferences {
  // 視覺偏好
  highContrast: boolean
  fontSize: number
  reducedMotion: boolean
  darkMode: boolean
  
  // 互動偏好
  focusVisible: boolean
  keyboardNavigation: boolean
  voiceNavigation: boolean
  
  // 內容偏好
  simpleLanguage: boolean
  descriptiveText: boolean
  contentSummary: boolean
  
  // 音訊偏好
  soundEnabled: boolean
  screenReaderSpeed: number
  announcements: boolean
}

export interface AccessibilityAuditSettings {
  checkImages: boolean
  checkHeadings: boolean
  checkLinks: boolean
  checkForms: boolean
  checkColorContrast: boolean
  checkKeyboardAccess: boolean
  checkAriaLabels: boolean
  checkLandmarks: boolean
  wcagLevel: 'A' | 'AA' | 'AAA'
  includeWarnings: boolean
}

export interface AccessibilityUserProfile {
  userId: string
  preferences: AccessibilityPreferences
  assistiveTechnology: string[]
  disabilityTypes: string[]
  notes: string
  lastUpdated: Date
}

/**
 * 無障礙服務類別
 */
export class AccessibilityService {
  private preferences: AccessibilityPreferences
  private userProfile: AccessibilityUserProfile | null = null
  private observers: (() => void)[] = []

  constructor() {
    this.preferences = this.getDefaultPreferences()
    this.loadPreferences()
    this.detectSystemPreferences()
  }

  /**
   * 獲取預設偏好設定
   */
  private getDefaultPreferences(): AccessibilityPreferences {
    return {
      highContrast: false,
      fontSize: 16,
      reducedMotion: false,
      darkMode: false,
      focusVisible: true,
      keyboardNavigation: true,
      voiceNavigation: false,
      simpleLanguage: false,
      descriptiveText: false,
      contentSummary: false,
      soundEnabled: true,
      screenReaderSpeed: 1,
      announcements: true
    }
  }

  /**
   * 從本地儲存載入偏好設定
   */
  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('accessibility-preferences')
      if (saved) {
        const parsed = JSON.parse(saved) as AccessibilityPreferences
        this.preferences = { ...this.preferences, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load accessibility preferences:', error)
    }
  }

  /**
   * 儲存偏好設定到本地儲存
   */
  private savePreferences(): void {
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(this.preferences))
      this.notifyObservers()
    } catch (error) {
      console.warn('Failed to save accessibility preferences:', error)
    }
  }

  /**
   * 檢測系統偏好設定
   */
  private detectSystemPreferences(): void {
    if (typeof window === 'undefined') return

    // 檢測高對比度模式
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.preferences.highContrast = true
    }

    // 檢測減少動畫偏好
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.preferences.reducedMotion = true
    }

    // 檢測深色模式偏好
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.preferences.darkMode = true
    }

    // 監聽系統偏好變化
    if (window.matchMedia) {
      window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
        this.updatePreference('highContrast', e.matches)
      })

      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        this.updatePreference('reducedMotion', e.matches)
      })

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        this.updatePreference('darkMode', e.matches)
      })
    }
  }

  /**
   * 獲取目前偏好設定
   */
  getPreferences(): AccessibilityPreferences {
    return { ...this.preferences }
  }

  /**
   * 更新偏好設定
   */
  updatePreferences(updates: Partial<AccessibilityPreferences>): void {
    this.preferences = { ...this.preferences, ...updates }
    this.savePreferences()
    this.applyPreferences()
  }

  /**
   * 更新單一偏好設定
   */
  updatePreference<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ): void {
    this.preferences[key] = value
    this.savePreferences()
    this.applyPreferences()
  }

  /**
   * 應用偏好設定到 DOM
   */
  private applyPreferences(): void {
    const root = document.documentElement

    // 高對比度
    root.classList.toggle('high-contrast', this.preferences.highContrast)

    // 字體大小
    root.style.setProperty('--accessibility-font-size', `${this.preferences.fontSize}px`)

    // 減少動畫
    root.classList.toggle('reduced-motion', this.preferences.reducedMotion)

    // 深色模式
    root.classList.toggle('dark', this.preferences.darkMode)

    // 焦點可見
    root.classList.toggle('focus-visible', this.preferences.focusVisible)

    // 鍵盤導航
    root.classList.toggle('keyboard-navigation', this.preferences.keyboardNavigation)

    // 通知所有觀察者
    this.notifyObservers()
  }

  /**
   * 獲取使用者無障礙檔案
   */
  getUserProfile(): AccessibilityUserProfile | null {
    return this.userProfile
  }

  /**
   * 更新使用者無障礙檔案
   */
  updateUserProfile(profile: Partial<AccessibilityUserProfile>): void {
    if (this.userProfile) {
      this.userProfile = { 
        ...this.userProfile, 
        ...profile, 
        lastUpdated: new Date() 
      }
    } else {
      this.userProfile = {
        userId: profile.userId || '',
        preferences: profile.preferences || this.preferences,
        assistiveTechnology: profile.assistiveTechnology || [],
        disabilityTypes: profile.disabilityTypes || [],
        notes: profile.notes || '',
        lastUpdated: new Date()
      }
    }

    // 更新本地偏好設定
    if (profile.preferences) {
      this.updatePreferences(profile.preferences)
    }
  }

  /**
   * 重設為預設設定
   */
  resetToDefaults(): void {
    this.preferences = this.getDefaultPreferences()
    this.detectSystemPreferences()
    this.savePreferences()
    this.applyPreferences()
  }

  /**
   * 獲取建議的無障礙設定
   */
  getSuggestedSettings(disabilityTypes: string[]): Partial<AccessibilityPreferences> {
    const suggestions: Partial<AccessibilityPreferences> = {}

    // 視覺障礙建議
    if (disabilityTypes.includes('visual') || disabilityTypes.includes('low-vision')) {
      suggestions.highContrast = true
      suggestions.fontSize = 20
      suggestions.focusVisible = true
      suggestions.descriptiveText = true
    }

    // 聽覺障礙建議
    if (disabilityTypes.includes('hearing')) {
      suggestions.soundEnabled = false
      suggestions.announcements = false
      suggestions.descriptiveText = true
      suggestions.contentSummary = true
    }

    // 認知障礙建議
    if (disabilityTypes.includes('cognitive')) {
      suggestions.simpleLanguage = true
      suggestions.contentSummary = true
      suggestions.reducedMotion = true
    }

    // 運動障礙建議
    if (disabilityTypes.includes('motor')) {
      suggestions.keyboardNavigation = true
      suggestions.focusVisible = true
      suggestions.voiceNavigation = true
    }

    return suggestions
  }

  /**
   * 檢查瀏覽器無障礙支援
   */
  checkBrowserSupport(): {
    feature: string
    supported: boolean
    fallback?: string
  }[] {
    const checks = [
      {
        feature: 'Screen Reader API',
        supported: 'speechSynthesis' in window,
        fallback: '使用 ARIA 標籤'
      },
      {
        feature: 'High Contrast',
        supported: window.matchMedia('(prefers-contrast: high)').matches !== undefined,
        fallback: '手動切換高對比度'
      },
      {
        feature: 'Reduced Motion',
        supported: window.matchMedia('(prefers-reduced-motion: reduce)').matches !== undefined,
        fallback: '提供動畫控制選項'
      },
      {
        feature: 'Focus Visible',
        supported: CSS.supports('selector(:focus-visible)'),
        fallback: '使用 :focus 偽類'
      },
      {
        feature: 'Color Scheme',
        supported: window.matchMedia('(prefers-color-scheme: dark)').matches !== undefined,
        fallback: '手動切換深色模式'
      }
    ]

    return checks
  }

  /**
   * 生成無障礙聲明
   */
  generateAccessibilityStatement(): {
    compliance: string
    features: string[]
    limitations: string[]
    contactInfo: string
    lastUpdated: Date
  } {
    return {
      compliance: 'WCAG 2.1 AA',
      features: [
        '鍵盤導航支援',
        '螢幕閱讀器相容',
        '高對比度模式',
        '字體大小調整',
        '減少動畫選項',
        'ARIA 標籤和語意',
        '焦點管理',
        '顏色對比符合標準'
      ],
      limitations: [
        '某些第三方內容可能無法完全無障礙',
        '複雜圖表需要額外說明',
        '視頻內容需要字幕支援'
      ],
      contactInfo: '如有無障礙問題，請聯絡我們：accessibility@example.com',
      lastUpdated: new Date()
    }
  }

  /**
   * 匯出無障礙設定
   */
  exportSettings(): string {
    const exportData = {
      preferences: this.preferences,
      userProfile: this.userProfile,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 匯入無障礙設定
   */
  importSettings(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData)
      
      if (importData.preferences) {
        this.updatePreferences(importData.preferences)
      }
      
      if (importData.userProfile) {
        this.updateUserProfile(importData.userProfile)
      }
      
      return true
    } catch (error) {
      console.error('Failed to import accessibility settings:', error)
      return false
    }
  }

  /**
   * 訂閱偏好設定變化
   */
  subscribe(callback: () => void): () => void {
    this.observers.push(callback)
    
    // 返回取消訂閱函數
    return () => {
      const index = this.observers.indexOf(callback)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }

  /**
   * 通知所有觀察者
   */
  private notifyObservers(): void {
    this.observers.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('Error in accessibility observer:', error)
      }
    })
  }

  /**
   * 檢查內容的無障礙性
   */
  async auditContent(element: HTMLElement, settings?: AccessibilityAuditSettings): Promise<AccessibilityReport> {
    const { AccessibilityTester } = await import('@/utils/accessibilityTester')
    const tester = new AccessibilityTester(element)
    
    if (settings?.wcagLevel) {
      // 根據設定自訂檢測項目
      return await tester.runFullAudit()
    }
    
    return await tester.runQuickAudit()
  }

  /**
   * 生成無障礙報告
   */
  async generateReport(element?: HTMLElement): Promise<{
    summary: string
    score: number
    recommendations: string[]
    report: AccessibilityReport
  }> {
    const report = await this.auditContent(element || document.body)
    
    const recommendations = []
    
    if (report.issuesBySeverity.critical > 0) {
      recommendations.push('立即修復關鍵的無障礙問題')
    }
    
    if (report.issuesBySeverity.serious > 0) {
      recommendations.push('優先處理嚴重的無障礙問題')
    }
    
    if (report.score < 70) {
      recommendations.push('建議全面檢查無障礙實作')
    }

    if (report.score < 90) {
      recommendations.push('可考慮增加無障礙測試')
    }

    const summary = `發現 ${report.totalIssues} 個無障礙問題，分數為 ${report.score}/100`
    
    return {
      summary,
      score: report.score,
      recommendations,
      report
    }
  }

  /**
   * 初始化無障礙服務
   */
  initialize(): void {
    this.applyPreferences()
    
    // 設定全域樣式
    this.setupGlobalStyles()
    
    // 監聽鍵盤事件
    this.setupKeyboardListeners()
  }

  /**
   * 設定全域無障礙樣式
   */
  private setupGlobalStyles(): void {
    const styleSheet = document.createElement('style')
    styleSheet.textContent = `
      /* 無障礙全域樣式 */
      .high-contrast {
        filter: contrast(150%) brightness(1.2);
      }
      
      .high-contrast * {
        text-shadow: none !important;
        box-shadow: none !important;
      }
      
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      .focus-visible button:focus-visible,
      .focus-visible a:focus-visible,
      .focus-visible input:focus-visible,
      .focus-visible select:focus-visible,
      .focus-visible textarea:focus-visible {
        outline: 3px solid #4f46e5 !important;
        outline-offset: 2px !important;
      }
      
      .keyboard-navigation body {
        --focus-ring-color: #4f46e5;
        --focus-ring-width: 3px;
      }
      
      .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
    `
    
    document.head.appendChild(styleSheet)
  }

  /**
   * 設定鍵盤監聽器
   */
  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (event) => {
      // Tab 鍵檢測鍵盤導航
      if (event.key === 'Tab') {
        document.body.classList.add('user-is-tabbing')
      }
    })

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('user-is-tabbing')
    })
  }

  /**
   * 銷毀服務
   */
  destroy(): void {
    this.observers = []
  }
}

// 單例模式
export const accessibilityService = new AccessibilityService()

// 便利函數
export function useAccessibilityService() {
  return accessibilityService
}