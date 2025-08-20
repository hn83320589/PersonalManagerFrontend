import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * 無障礙功能 Composable
 * 提供鍵盤導航、焦點管理、螢幕閱讀器支援等功能
 */
export function useAccessibility() {
  const isHighContrastMode = ref(false)
  const isReducedMotion = ref(false)
  const focusRing = ref(true)

  // 檢測用戶偏好設定
  const updatePreferences = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      // 高對比度模式
      isHighContrastMode.value = window.matchMedia('(prefers-contrast: high)').matches ||
                                 window.matchMedia('(-ms-high-contrast: active)').matches
      
      // 減少動畫
      isReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  }

  // 焦點環顯示管理
  const handleFocusVisible = (event: KeyboardEvent) => {
    // 當使用鍵盤時顯示焦點環
    if (event.key === 'Tab') {
      focusRing.value = true
      document.body.classList.add('focus-visible')
    }
  }

  const handleMouseDown = () => {
    // 當使用滑鼠時隱藏焦點環
    focusRing.value = false
    document.body.classList.remove('focus-visible')
  }

  // 初始化無障礙設定
  const initializeAccessibility = () => {
    updatePreferences()
    
    // 添加事件監聽
    window.addEventListener('keydown', handleFocusVisible)
    window.addEventListener('mousedown', handleMouseDown)
    
    // 監聽媒體查詢變化
    if (window.matchMedia) {
      window.matchMedia('(prefers-contrast: high)').addEventListener('change', updatePreferences)
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', updatePreferences)
    }
  }

  // 清理
  const cleanup = () => {
    window.removeEventListener('keydown', handleFocusVisible)
    window.removeEventListener('mousedown', handleMouseDown)
    
    if (window.matchMedia) {
      window.matchMedia('(prefers-contrast: high)').removeEventListener('change', updatePreferences)
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', updatePreferences)
    }
  }

  onMounted(initializeAccessibility)
  onUnmounted(cleanup)

  return {
    isHighContrastMode,
    isReducedMotion,
    focusRing
  }
}

/**
 * 焦點管理 Composable
 * 用於管理元件的焦點狀態和鍵盤導航
 */
export function useFocusManagement() {
  const focusedElement = ref<HTMLElement | null>(null)
  const focusTrap = ref(false)

  // 設置焦點
  const setFocus = (element: HTMLElement | null) => {
    if (element && element.focus) {
      element.focus()
      focusedElement.value = element
    }
  }

  // 焦點陷阱 - 將焦點限制在指定容器內
  const trapFocus = (container: HTMLElement) => {
    if (!container) return

    focusTrap.value = true
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
      focusTrap.value = false
    }
  }

  // 恢復焦點到先前的元素
  const restoreFocus = (element?: HTMLElement) => {
    const targetElement = element || focusedElement.value
    if (targetElement) {
      nextTick(() => {
        targetElement.focus()
      })
    }
  }

  // 尋找下一個可聚焦元素
  const getNextFocusableElement = (current: HTMLElement, direction: 'next' | 'prev' = 'next'): HTMLElement | null => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"])'
      )
    ) as HTMLElement[]

    const currentIndex = focusableElements.indexOf(current)
    if (currentIndex === -1) return null

    if (direction === 'next') {
      return focusableElements[currentIndex + 1] || focusableElements[0]
    } else {
      return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1]
    }
  }

  return {
    focusedElement,
    focusTrap,
    setFocus,
    trapFocus,
    restoreFocus,
    getNextFocusableElement
  }
}

/**
 * 鍵盤導航 Composable
 * 提供鍵盤快捷鍵和導航功能
 */
export function useKeyboardNavigation(options: {
  onEscape?: () => void
  onEnter?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onHome?: () => void
  onEnd?: () => void
  onPageUp?: () => void
  onPageDown?: () => void
} = {}) {
  const keyHandlers = new Map<string, () => void>()

  // 設置鍵盤處理器
  if (options.onEscape) keyHandlers.set('Escape', options.onEscape)
  if (options.onEnter) keyHandlers.set('Enter', options.onEnter)
  if (options.onArrowUp) keyHandlers.set('ArrowUp', options.onArrowUp)
  if (options.onArrowDown) keyHandlers.set('ArrowDown', options.onArrowDown)
  if (options.onArrowLeft) keyHandlers.set('ArrowLeft', options.onArrowLeft)
  if (options.onArrowRight) keyHandlers.set('ArrowRight', options.onArrowRight)
  if (options.onHome) keyHandlers.set('Home', options.onHome)
  if (options.onEnd) keyHandlers.set('End', options.onEnd)
  if (options.onPageUp) keyHandlers.set('PageUp', options.onPageUp)
  if (options.onPageDown) keyHandlers.set('PageDown', options.onPageDown)

  const handleKeyDown = (event: KeyboardEvent) => {
    const handler = keyHandlers.get(event.key)
    if (handler) {
      event.preventDefault()
      handler()
    }
  }

  const addKeyHandler = (key: string, handler: () => void) => {
    keyHandlers.set(key, handler)
  }

  const removeKeyHandler = (key: string) => {
    keyHandlers.delete(key)
  }

  const startListening = (element: HTMLElement | Document = document) => {
    element.addEventListener('keydown', handleKeyDown)
  }

  const stopListening = (element: HTMLElement | Document = document) => {
    element.removeEventListener('keydown', handleKeyDown)
  }

  return {
    handleKeyDown,
    addKeyHandler,
    removeKeyHandler,
    startListening,
    stopListening
  }
}

/**
 * 螢幕閱讀器支援 Composable
 * 提供 ARIA 標籤和螢幕閱讀器公告功能
 */
export function useScreenReader() {
  const announceRegion = ref<HTMLElement>()

  // 建立公告區域
  const createAnnounceRegion = () => {
    const region = document.createElement('div')
    region.setAttribute('aria-live', 'polite')
    region.setAttribute('aria-atomic', 'true')
    region.style.position = 'absolute'
    region.style.left = '-10000px'
    region.style.width = '1px'
    region.style.height = '1px'
    region.style.overflow = 'hidden'
    document.body.appendChild(region)
    announceRegion.value = region
    return region
  }

  // 向螢幕閱讀器公告消息
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceRegion.value) {
      createAnnounceRegion()
    }

    if (announceRegion.value) {
      announceRegion.value.setAttribute('aria-live', priority)
      announceRegion.value.textContent = message
      
      // 清空內容，確保重複消息也會被讀出
      setTimeout(() => {
        if (announceRegion.value) {
          announceRegion.value.textContent = ''
        }
      }, 1000)
    }
  }

  // 生成唯一的 ID
  const generateId = (prefix = 'a11y') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }

  // ARIA 屬性輔助函數
  const setAriaLabel = (element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label)
  }

  const setAriaLabelledBy = (element: HTMLElement, ids: string | string[]) => {
    const idList = Array.isArray(ids) ? ids.join(' ') : ids
    element.setAttribute('aria-labelledby', idList)
  }

  const setAriaDescribedBy = (element: HTMLElement, ids: string | string[]) => {
    const idList = Array.isArray(ids) ? ids.join(' ') : ids
    element.setAttribute('aria-describedby', idList)
  }

  const setAriaExpanded = (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString())
  }

  const setAriaPressed = (element: HTMLElement, pressed: boolean) => {
    element.setAttribute('aria-pressed', pressed.toString())
  }

  const setAriaSelected = (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString())
  }

  const setAriaChecked = (element: HTMLElement, checked: boolean | 'mixed') => {
    element.setAttribute('aria-checked', checked.toString())
  }

  const setAriaDisabled = (element: HTMLElement, disabled: boolean) => {
    element.setAttribute('aria-disabled', disabled.toString())
  }

  const setAriaHidden = (element: HTMLElement, hidden: boolean) => {
    element.setAttribute('aria-hidden', hidden.toString())
  }

  // 設置角色
  const setRole = (element: HTMLElement, role: string) => {
    element.setAttribute('role', role)
  }

  // 清理
  const cleanup = () => {
    if (announceRegion.value) {
      document.body.removeChild(announceRegion.value)
      announceRegion.value = undefined
    }
  }

  onMounted(createAnnounceRegion)
  onUnmounted(cleanup)

  return {
    announce,
    generateId,
    setAriaLabel,
    setAriaLabelledBy,
    setAriaDescribedBy,
    setAriaExpanded,
    setAriaPressed,
    setAriaSelected,
    setAriaChecked,
    setAriaDisabled,
    setAriaHidden,
    setRole
  }
}

/**
 * 顏色對比檢查 Composable
 * 用於檢查和確保適當的顏色對比度
 */
export function useColorContrast() {
  // 將十六進制顏色轉換為 RGB
  const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : null
  }

  // 計算相對亮度
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // 計算對比度
  const getContrast = (color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1)
    const rgb2 = hexToRgb(color2)
    
    if (!rgb1 || !rgb2) return 0
    
    const lum1 = getLuminance(...rgb1)
    const lum2 = getLuminance(...rgb2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  // 檢查是否符合 WCAG 標準
  const checkWCAGCompliance = (contrast: number, level: 'AA' | 'AAA' = 'AA', isLargeText = false): boolean => {
    const requirements = {
      AA: { normal: 4.5, large: 3 },
      AAA: { normal: 7, large: 4.5 }
    }
    
    const required = isLargeText ? requirements[level].large : requirements[level].normal
    return contrast >= required
  }

  // 獲取建議的文字顏色
  const getSuggestedTextColor = (backgroundColor: string): string => {
    const rgb = hexToRgb(backgroundColor)
    if (!rgb) return '#000000'
    
    const luminance = getLuminance(...rgb)
    return luminance > 0.179 ? '#000000' : '#ffffff'
  }

  return {
    hexToRgb,
    getLuminance,
    getContrast,
    checkWCAGCompliance,
    getSuggestedTextColor
  }
}

/**
 * 無障礙表單 Composable
 * 提供表單無障礙功能
 */
export function useAccessibleForm() {
  const { generateId, setAriaLabelledBy, setAriaDescribedBy, announce } = useScreenReader()

  // 關聯標籤和輸入框
  const associateLabel = (input: HTMLElement, label: HTMLElement, labelText?: string) => {
    const id = input.id || generateId('input')
    input.id = id
    label.setAttribute('for', id)
    
    if (labelText) {
      label.textContent = labelText
    }
  }

  // 添加錯誤消息
  const addErrorMessage = (input: HTMLElement, message: string) => {
    const errorId = generateId('error')
    const errorElement = document.createElement('div')
    errorElement.id = errorId
    errorElement.className = 'error-message'
    errorElement.setAttribute('aria-live', 'polite')
    errorElement.textContent = message
    
    input.parentNode?.appendChild(errorElement)
    setAriaDescribedBy(input, errorId)
    input.setAttribute('aria-invalid', 'true')
    
    announce(`錯誤：${message}`, 'assertive')
    
    return errorElement
  }

  // 移除錯誤消息
  const removeErrorMessage = (input: HTMLElement) => {
    const errorId = input.getAttribute('aria-describedby')
    if (errorId) {
      const errorElement = document.getElementById(errorId)
      if (errorElement) {
        errorElement.remove()
        input.removeAttribute('aria-describedby')
        input.setAttribute('aria-invalid', 'false')
      }
    }
  }

  // 添加輔助文字
  const addHelpText = (input: HTMLElement, helpText: string) => {
    const helpId = generateId('help')
    const helpElement = document.createElement('div')
    helpElement.id = helpId
    helpElement.className = 'help-text'
    helpElement.textContent = helpText
    
    input.parentNode?.appendChild(helpElement)
    setAriaDescribedBy(input, helpId)
    
    return helpElement
  }

  // 標記必填欄位
  const markRequired = (input: HTMLElement, label?: HTMLElement) => {
    input.setAttribute('required', '')
    input.setAttribute('aria-required', 'true')
    
    if (label) {
      const indicator = document.createElement('span')
      indicator.className = 'required-indicator'
      indicator.textContent = '*'
      indicator.setAttribute('aria-label', '必填')
      label.appendChild(indicator)
    }
  }

  return {
    associateLabel,
    addErrorMessage,
    removeErrorMessage,
    addHelpText,
    markRequired
  }
}