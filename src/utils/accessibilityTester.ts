/**
 * 無障礙測試工具
 * 提供自動化無障礙檢測和報告功能
 */

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  rule: string
  message: string
  element: HTMLElement
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  wcagLevel: 'A' | 'AA' | 'AAA'
  wcagCriteria: string
}

export interface AccessibilityReport {
  timestamp: Date
  totalElements: number
  totalIssues: number
  issuesByType: Record<AccessibilityIssue['type'], number>
  issuesBySeverity: Record<AccessibilityIssue['severity'], number>
  issues: AccessibilityIssue[]
  score: number // 0-100
  passedChecks: string[]
  failedChecks: string[]
}

/**
 * 無障礙測試器類別
 */
export class AccessibilityTester {
  private container: HTMLElement | Document
  private issues: AccessibilityIssue[] = []

  constructor(container: HTMLElement | Document = document) {
    this.container = container
  }

  /**
   * 執行完整的無障礙檢測
   */
  async runFullAudit(): Promise<AccessibilityReport> {
    this.issues = []
    
    // 執行各項檢測
    await Promise.all([
      this.checkImages(),
      this.checkHeadings(),
      this.checkLinks(),
      this.checkForms(),
      this.checkButtons(),
      this.checkColorContrast(),
      this.checkKeyboardAccess(),
      this.checkAriaLabels(),
      this.checkLandmarks(),
      this.checkTables(),
      this.checkLists(),
      this.checkDocumentStructure()
    ])

    return this.generateReport()
  }

  /**
   * 檢查圖片無障礙性
   */
  private async checkImages(): Promise<void> {
    const images = this.container.querySelectorAll('img')
    
    images.forEach((img) => {
      const alt = img.getAttribute('alt')
      const ariaLabel = img.getAttribute('aria-label')
      const ariaLabelledBy = img.getAttribute('aria-labelledby')
      const role = img.getAttribute('role')
      
      // 檢查是否為裝飾性圖片
      const isDecorative = role === 'presentation' || role === 'none' || alt === ''
      
      if (!isDecorative && !alt && !ariaLabel && !ariaLabelledBy) {
        this.addIssue({
          type: 'error',
          rule: 'img-alt',
          message: '圖片缺少替代文字 (alt 屬性)',
          element: img,
          severity: 'critical',
          wcagLevel: 'A',
          wcagCriteria: '1.1.1'
        })
      }
      
      // 檢查 alt 文字品質
      if (alt && (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture'))) {
        this.addIssue({
          type: 'warning',
          rule: 'img-alt-quality',
          message: 'Alt 文字應該描述圖片內容，而不是說明這是一張圖片',
          element: img,
          severity: 'moderate',
          wcagLevel: 'A',
          wcagCriteria: '1.1.1'
        })
      }
    })
  }

  /**
   * 檢查標題結構
   */
  private async checkHeadings(): Promise<void> {
    const headings = Array.from(this.container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    
    if (headings.length === 0) {
      this.addIssue({
        type: 'warning',
        rule: 'page-has-heading-one',
        message: '頁面應該包含標題以建立內容結構',
        element: document.body,
        severity: 'serious',
        wcagLevel: 'AA',
        wcagCriteria: '1.3.1'
      })
      return
    }

    let previousLevel = 0
    const h1Count = headings.filter(h => h.tagName === 'H1').length

    // 檢查是否有 H1
    if (h1Count === 0) {
      this.addIssue({
        type: 'error',
        rule: 'page-has-heading-one',
        message: '頁面應該有一個 H1 標題',
        element: document.body,
        severity: 'serious',
        wcagLevel: 'AA',
        wcagCriteria: '1.3.1'
      })
    }

    // 檢查是否有多個 H1
    if (h1Count > 1) {
      this.addIssue({
        type: 'warning',
        rule: 'page-has-heading-one',
        message: '頁面應該只有一個 H1 標題',
        element: document.body,
        severity: 'moderate',
        wcagLevel: 'AA',
        wcagCriteria: '1.3.1'
      })
    }

    // 檢查標題層級順序
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1))
      
      if (previousLevel > 0 && level > previousLevel + 1) {
        this.addIssue({
          type: 'error',
          rule: 'heading-order',
          message: `標題層級跳躍：從 H${previousLevel} 直接跳到 H${level}`,
          element: heading as HTMLElement,
          severity: 'serious',
          wcagLevel: 'AA',
          wcagCriteria: '1.3.1'
        })
      }

      // 檢查空標題
      if (!heading.textContent?.trim()) {
        this.addIssue({
          type: 'error',
          rule: 'empty-heading',
          message: '標題不能為空',
          element: heading as HTMLElement,
          severity: 'serious',
          wcagLevel: 'A',
          wcagCriteria: '1.3.1'
        })
      }

      previousLevel = level
    })
  }

  /**
   * 檢查連結無障礙性
   */
  private async checkLinks(): Promise<void> {
    const links = this.container.querySelectorAll('a')
    
    links.forEach((link) => {
      const href = link.getAttribute('href')
      const text = link.textContent?.trim()
      const ariaLabel = link.getAttribute('aria-label')
      const ariaLabelledBy = link.getAttribute('aria-labelledby')
      
      // 檢查空連結
      if (!text && !ariaLabel && !ariaLabelledBy) {
        this.addIssue({
          type: 'error',
          rule: 'link-name',
          message: '連結必須有可讀的文字',
          element: link,
          severity: 'critical',
          wcagLevel: 'A',
          wcagCriteria: '4.1.2'
        })
      }

      // 檢查通用連結文字
      if (text && ['click here', 'here', 'more', 'read more', '點此', '更多'].includes(text.toLowerCase())) {
        this.addIssue({
          type: 'warning',
          rule: 'link-name-descriptive',
          message: '連結文字應該描述其目的地或功能',
          element: link,
          severity: 'moderate',
          wcagLevel: 'AA',
          wcagCriteria: '2.4.4'
        })
      }

      // 檢查外部連結
      if (href && (href.startsWith('http') && !href.includes(location.hostname))) {
        const hasIndicator = link.querySelector('[aria-label*="外部"]') || 
                           link.textContent?.includes('外部') ||
                           link.getAttribute('aria-label')?.includes('外部')
        
        if (!hasIndicator) {
          this.addIssue({
            type: 'info',
            rule: 'external-link-indicator',
            message: '外部連結應該有明確的指示',
            element: link,
            severity: 'minor',
            wcagLevel: 'AAA',
            wcagCriteria: '3.2.5'
          })
        }
      }
    })
  }

  /**
   * 檢查表單無障礙性
   */
  private async checkForms(): Promise<void> {
    const formElements = this.container.querySelectorAll('input, select, textarea')
    
    formElements.forEach((element) => {
      const input = element as HTMLInputElement
      const type = input.type
      const id = input.id
      const name = input.name
      const label = id ? this.container.querySelector(`label[for="${id}"]`) : null
      const ariaLabel = input.getAttribute('aria-label')
      const ariaLabelledBy = input.getAttribute('aria-labelledby')
      
      // 檢查標籤
      if (!label && !ariaLabel && !ariaLabelledBy && type !== 'hidden' && type !== 'submit' && type !== 'button') {
        this.addIssue({
          type: 'error',
          rule: 'label',
          message: '表單控制項必須有相關聯的標籤',
          element: input,
          severity: 'critical',
          wcagLevel: 'A',
          wcagCriteria: '1.3.1'
        })
      }

      // 檢查必填欄位
      if (input.required && !input.getAttribute('aria-required')) {
        this.addIssue({
          type: 'warning',
          rule: 'aria-required-attr',
          message: '必填欄位應該有 aria-required 屬性',
          element: input,
          severity: 'moderate',
          wcagLevel: 'A',
          wcagCriteria: '4.1.2'
        })
      }

      // 檢查錯誤狀態
      if (input.getAttribute('aria-invalid') === 'true') {
        const errorId = input.getAttribute('aria-describedby')
        if (!errorId || !this.container.querySelector(`#${errorId}`)) {
          this.addIssue({
            type: 'error',
            rule: 'aria-describedby-valid',
            message: '無效的表單控制項應該有相關聯的錯誤訊息',
            element: input,
            severity: 'serious',
            wcagLevel: 'AA',
            wcagCriteria: '3.3.1'
          })
        }
      }
    })
  }

  /**
   * 檢查按鈕無障礙性
   */
  private async checkButtons(): Promise<void> {
    const buttons = this.container.querySelectorAll('button, [role="button"]')
    
    buttons.forEach((button) => {
      const text = button.textContent?.trim()
      const ariaLabel = button.getAttribute('aria-label')
      const ariaLabelledBy = button.getAttribute('aria-labelledby')
      
      // 檢查按鈕文字
      if (!text && !ariaLabel && !ariaLabelledBy) {
        this.addIssue({
          type: 'error',
          rule: 'button-name',
          message: '按鈕必須有可讀的文字',
          element: button as HTMLElement,
          severity: 'critical',
          wcagLevel: 'A',
          wcagCriteria: '4.1.2'
        })
      }

      // 檢查按鈕類型
      if (button.tagName === 'BUTTON' && !button.getAttribute('type')) {
        this.addIssue({
          type: 'warning',
          rule: 'button-type',
          message: '按鈕應該明確指定 type 屬性',
          element: button as HTMLElement,
          severity: 'minor',
          wcagLevel: 'AA',
          wcagCriteria: '4.1.2'
        })
      }
    })
  }

  /**
   * 檢查顏色對比度
   */
  private async checkColorContrast(): Promise<void> {
    const textElements = this.container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label')
    
    textElements.forEach((element) => {
      const htmlElement = element as HTMLElement
      const text = htmlElement.textContent?.trim()
      
      if (!text) return

      const styles = window.getComputedStyle(htmlElement)
      const color = styles.color
      const backgroundColor = styles.backgroundColor
      const fontSize = parseFloat(styles.fontSize)
      
      // 簡化的對比度檢查 (實際實作需要更複雜的顏色解析)
      if (color === backgroundColor) {
        this.addIssue({
          type: 'error',
          rule: 'color-contrast',
          message: '文字和背景顏色對比度不足',
          element: htmlElement,
          severity: 'serious',
          wcagLevel: 'AA',
          wcagCriteria: '1.4.3'
        })
      }
    })
  }

  /**
   * 檢查鍵盤可訪問性
   */
  private async checkKeyboardAccess(): Promise<void> {
    const interactiveElements = this.container.querySelectorAll(
      'a, button, input, select, textarea, [tabindex], [contenteditable], [role="button"], [role="link"], [role="menuitem"]'
    )
    
    interactiveElements.forEach((element) => {
      const htmlElement = element as HTMLElement
      const tabIndex = htmlElement.getAttribute('tabindex')
      
      // 檢查負數 tabindex
      if (tabIndex && parseInt(tabIndex) < -1) {
        this.addIssue({
          type: 'warning',
          rule: 'tabindex',
          message: 'tabindex 值不應該小於 -1',
          element: htmlElement,
          severity: 'moderate',
          wcagLevel: 'A',
          wcagCriteria: '2.1.1'
        })
      }

      // 檢查大於 0 的 tabindex
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.addIssue({
          type: 'warning',
          rule: 'tabindex-no-positive',
          message: '避免使用正數的 tabindex 值',
          element: htmlElement,
          severity: 'moderate',
          wcagLevel: 'A',
          wcagCriteria: '2.4.3'
        })
      }
    })
  }

  /**
   * 檢查 ARIA 標籤
   */
  private async checkAriaLabels(): Promise<void> {
    const elementsWithAria = this.container.querySelectorAll('[aria-labelledby], [aria-describedby]')
    
    elementsWithAria.forEach((element) => {
      const labelledBy = element.getAttribute('aria-labelledby')
      const describedBy = element.getAttribute('aria-describedby')
      
      // 檢查 aria-labelledby 引用
      if (labelledBy) {
        const ids = labelledBy.split(' ')
        ids.forEach(id => {
          if (!this.container.querySelector(`#${id}`)) {
            this.addIssue({
              type: 'error',
              rule: 'aria-labelledby-valid',
              message: `aria-labelledby 引用的元素 "${id}" 不存在`,
              element: element as HTMLElement,
              severity: 'serious',
              wcagLevel: 'A',
              wcagCriteria: '4.1.2'
            })
          }
        })
      }

      // 檢查 aria-describedby 引用
      if (describedBy) {
        const ids = describedBy.split(' ')
        ids.forEach(id => {
          if (!this.container.querySelector(`#${id}`)) {
            this.addIssue({
              type: 'error',
              rule: 'aria-describedby-valid',
              message: `aria-describedby 引用的元素 "${id}" 不存在`,
              element: element as HTMLElement,
              severity: 'serious',
              wcagLevel: 'A',
              wcagCriteria: '4.1.2'
            })
          }
        })
      }
    })
  }

  /**
   * 檢查地標元素
   */
  private async checkLandmarks(): Promise<void> {
    const main = this.container.querySelector('main, [role="main"]')
    const nav = this.container.querySelector('nav, [role="navigation"]')
    
    if (!main) {
      this.addIssue({
        type: 'warning',
        rule: 'landmark-main-is-top-level',
        message: '頁面應該有主要內容地標 (main 元素)',
        element: document.body,
        severity: 'moderate',
        wcagLevel: 'AA',
        wcagCriteria: '1.3.1'
      })
    }

    // 檢查地標元素的唯一性
    const landmarks = this.container.querySelectorAll('[role="banner"], [role="main"], [role="contentinfo"]')
    const landmarkCounts: Record<string, number> = {}
    
    landmarks.forEach((landmark) => {
      const role = landmark.getAttribute('role') || landmark.tagName.toLowerCase()
      landmarkCounts[role] = (landmarkCounts[role] || 0) + 1
    })

    Object.entries(landmarkCounts).forEach(([role, count]) => {
      if (count > 1 && ['banner', 'main', 'contentinfo'].includes(role)) {
        this.addIssue({
          type: 'warning',
          rule: 'landmark-unique',
          message: `頁面中不應該有多個 ${role} 地標`,
          element: document.body,
          severity: 'moderate',
          wcagLevel: 'AA',
          wcagCriteria: '1.3.1'
        })
      }
    })
  }

  /**
   * 檢查表格無障礙性
   */
  private async checkTables(): Promise<void> {
    const tables = this.container.querySelectorAll('table')
    
    tables.forEach((table) => {
      const caption = table.querySelector('caption')
      const headers = table.querySelectorAll('th')
      
      // 檢查表格標題
      if (!caption && !table.getAttribute('aria-label') && !table.getAttribute('aria-labelledby')) {
        this.addIssue({
          type: 'warning',
          rule: 'table-caption',
          message: '表格應該有標題或描述',
          element: table,
          severity: 'moderate',
          wcagLevel: 'AA',
          wcagCriteria: '1.3.1'
        })
      }

      // 檢查表頭
      if (headers.length === 0) {
        this.addIssue({
          type: 'error',
          rule: 'table-headers',
          message: '表格應該有表頭 (th 元素)',
          element: table,
          severity: 'serious',
          wcagLevel: 'A',
          wcagCriteria: '1.3.1'
        })
      }
    })
  }

  /**
   * 檢查列表結構
   */
  private async checkLists(): Promise<void> {
    const lists = this.container.querySelectorAll('ul, ol')
    
    lists.forEach((list) => {
      const items = list.children
      let hasValidItems = false
      
      Array.from(items).forEach((item) => {
        if (item.tagName === 'LI') {
          hasValidItems = true
        } else {
          this.addIssue({
            type: 'error',
            rule: 'list-structure',
            message: '列表中只能包含 li 元素',
            element: item as HTMLElement,
            severity: 'serious',
            wcagLevel: 'A',
            wcagCriteria: '1.3.1'
          })
        }
      })

      if (!hasValidItems) {
        this.addIssue({
          type: 'warning',
          rule: 'empty-list',
          message: '列表不應該為空',
          element: list as HTMLElement,
          severity: 'minor',
          wcagLevel: 'A',
          wcagCriteria: '1.3.1'
        })
      }
    })
  }

  /**
   * 檢查文檔結構
   */
  private async checkDocumentStructure(): Promise<void> {
    const html = document.documentElement
    const lang = html.getAttribute('lang')
    const title = document.title
    
    // 檢查語言屬性
    if (!lang) {
      this.addIssue({
        type: 'error',
        rule: 'html-has-lang',
        message: 'HTML 元素應該有 lang 屬性',
        element: html,
        severity: 'serious',
        wcagLevel: 'A',
        wcagCriteria: '3.1.1'
      })
    }

    // 檢查頁面標題
    if (!title || title.trim() === '') {
      this.addIssue({
        type: 'error',
        rule: 'document-title',
        message: '頁面必須有描述性的標題',
        element: document.head,
        severity: 'serious',
        wcagLevel: 'A',
        wcagCriteria: '2.4.2'
      })
    }

    // 檢查 viewport meta
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) {
      this.addIssue({
        type: 'warning',
        rule: 'meta-viewport',
        message: '應該設定 viewport meta 標籤以支援響應式設計',
        element: document.head,
        severity: 'moderate',
        wcagLevel: 'AA',
        wcagCriteria: '1.4.10'
      })
    }
  }

  /**
   * 添加問題到列表
   */
  private addIssue(issue: AccessibilityIssue): void {
    this.issues.push(issue)
  }

  /**
   * 生成測試報告
   */
  private generateReport(): AccessibilityReport {
    const totalElements = this.container.querySelectorAll('*').length
    const totalIssues = this.issues.length
    
    const issuesByType = this.issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1
      return acc
    }, {} as Record<AccessibilityIssue['type'], number>)

    const issuesBySeverity = this.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1
      return acc
    }, {} as Record<AccessibilityIssue['severity'], number>)

    // 計算分數 (簡化版)
    const errorWeight = 10
    const warningWeight = 5
    const infoWeight = 1
    
    const totalDeductions = 
      (issuesByType.error || 0) * errorWeight +
      (issuesByType.warning || 0) * warningWeight +
      (issuesByType.info || 0) * infoWeight

    const score = Math.max(0, 100 - totalDeductions)

    // 獲取通過和失敗的檢查項目
    const allRules = [
      'img-alt', 'heading-order', 'link-name', 'label', 'button-name',
      'color-contrast', 'keyboard-access', 'aria-labels', 'landmarks',
      'table-structure', 'list-structure', 'document-structure'
    ]
    
    const failedChecks = [...new Set(this.issues.map(issue => issue.rule))]
    const passedChecks = allRules.filter(rule => !failedChecks.includes(rule))

    return {
      timestamp: new Date(),
      totalElements,
      totalIssues,
      issuesByType,
      issuesBySeverity,
      issues: this.issues,
      score,
      passedChecks,
      failedChecks
    }
  }

  /**
   * 快速檢測 (僅檢查關鍵項目)
   */
  async runQuickAudit(): Promise<AccessibilityReport> {
    this.issues = []
    
    await Promise.all([
      this.checkImages(),
      this.checkHeadings(),
      this.checkForms(),
      this.checkDocumentStructure()
    ])

    return this.generateReport()
  }

  /**
   * 導出報告為 JSON
   */
  exportReportAsJSON(report: AccessibilityReport): string {
    return JSON.stringify(report, (key, value) => {
      if (key === 'element') {
        return `${value.tagName}${value.id ? '#' + value.id : ''}${value.className ? '.' + value.className.split(' ').join('.') : ''}`
      }
      return value
    }, 2)
  }

  /**
   * 導出報告為 CSV
   */
  exportReportAsCSV(report: AccessibilityReport): string {
    const headers = ['類型', '規則', '訊息', '元素', '嚴重性', 'WCAG 等級', 'WCAG 準則']
    const rows = report.issues.map(issue => [
      issue.type,
      issue.rule,
      issue.message,
      `${issue.element.tagName}${issue.element.id ? '#' + issue.element.id : ''}`,
      issue.severity,
      issue.wcagLevel,
      issue.wcagCriteria
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }
}

/**
 * 便利函數：執行頁面無障礙檢測
 */
export async function auditPageAccessibility(): Promise<AccessibilityReport> {
  const tester = new AccessibilityTester()
  return await tester.runFullAudit()
}

/**
 * 便利函數：執行元素無障礙檢測
 */
export async function auditElementAccessibility(element: HTMLElement): Promise<AccessibilityReport> {
  const tester = new AccessibilityTester(element)
  return await tester.runFullAudit()
}