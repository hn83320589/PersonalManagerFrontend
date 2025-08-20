<template>
  <!-- 跳到主內容連結 -->
  <a 
    href="#main-content"
    class="skip-to-main sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-br-lg"
    @click="skipToMain"
  >
    跳到主要內容
  </a>

  <!-- 無障礙工具列 -->
  <div
    v-if="showAccessibilityBar"
    class="accessibility-bar fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white p-2 shadow-lg"
    role="banner"
    aria-label="無障礙工具列"
  >
    <div class="container mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- 高對比度切換 -->
        <button
          type="button"
          @click="toggleHighContrast"
          :aria-pressed="settings.highContrast.toString()"
          class="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          title="切換高對比度模式"
        >
          <span class="sr-only">{{ settings.highContrast ? '關閉' : '開啟' }}</span>
          高對比度
        </button>

        <!-- 字體大小調整 -->
        <div class="flex items-center space-x-2">
          <button
            type="button"
            @click="decreaseFontSize"
            :disabled="settings.fontSize <= 12"
            class="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="減小字體"
            aria-label="減小字體大小"
          >
            A-
          </button>
          <span class="text-sm">{{ settings.fontSize }}px</span>
          <button
            type="button"
            @click="increaseFontSize"
            :disabled="settings.fontSize >= 24"
            class="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="增大字體"
            aria-label="增大字體大小"
          >
            A+
          </button>
        </div>

        <!-- 減少動畫 -->
        <button
          type="button"
          @click="toggleReducedMotion"
          :aria-pressed="settings.reducedMotion.toString()"
          class="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          title="切換減少動畫效果"
        >
          {{ settings.reducedMotion ? '恢復' : '減少' }}動畫
        </button>
      </div>

      <div class="flex items-center space-x-2">
        <!-- 設定按鈕 -->
        <button
          type="button"
          @click="showSettings = !showSettings"
          :aria-expanded="showSettings.toString()"
          class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          aria-controls="accessibility-settings-panel"
        >
          無障礙設定
        </button>

        <!-- 關閉工具列 -->
        <button
          type="button"
          @click="hideAccessibilityBar"
          class="px-2 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition-colors"
          title="隱藏無障礙工具列"
          aria-label="隱藏無障礙工具列"
        >
          ×
        </button>
      </div>
    </div>

    <!-- 設定面板 -->
    <div
      v-if="showSettings"
      id="accessibility-settings-panel"
      class="absolute top-full left-0 right-0 bg-white text-gray-900 border-t border-gray-300 shadow-lg"
      role="dialog"
      aria-labelledby="settings-title"
      aria-modal="false"
    >
      <div class="container mx-auto p-4">
        <AccessibilitySettings 
          @update:settings="updateSettings"
          :visible="showSettings"
        />
      </div>
    </div>
  </div>

  <!-- 鍵盤導航指示器 -->
  <div
    v-if="showKeyboardIndicator && isKeyboardNavigation"
    class="keyboard-indicator fixed top-1/2 left-4 transform -translate-y-1/2 z-30 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg"
    role="status"
    aria-live="polite"
  >
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
      </svg>
      <span class="text-sm">使用鍵盤導航中</span>
    </div>
  </div>

  <!-- 螢幕閱讀器專用內容 -->
  <div class="sr-only">
    <h1>Personal Manager - 個人管理系統</h1>
    <nav aria-label="主要導航">
      <h2>導航選單</h2>
    </nav>
  </div>

  <!-- 頁面結構標題（螢幕閱讀器用） -->
  <div v-if="pageStructure.length > 0" class="sr-only">
    <h2>頁面結構</h2>
    <ul>
      <li v-for="(item, index) in pageStructure" :key="index">
        <a :href="`#${item.id}`">{{ item.title }}</a>
      </li>
    </ul>
  </div>

  <!-- Live Region for announcements -->
  <div
    id="live-region"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  ></div>

  <!-- 無障礙測試模式 -->
  <div
    v-if="testMode"
    class="accessibility-test fixed bottom-4 right-4 z-50 bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-sm"
    role="region"
    aria-labelledby="test-mode-title"
  >
    <h3 id="test-mode-title" class="font-bold text-yellow-800 mb-2">
      無障礙測試模式
    </h3>
    <div class="space-y-2 text-sm text-yellow-700">
      <div>焦點元素: {{ currentFocusedElement || '無' }}</div>
      <div>ARIA 標籤: {{ currentAriaLabel || '無' }}</div>
      <div>角色: {{ currentRole || '無' }}</div>
      <button
        type="button"
        @click="testMode = false"
        class="mt-2 px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-yellow-800"
      >
        關閉測試模式
      </button>
    </div>
  </div>

  <!-- 主要內容區域 -->
  <main id="main-content" tabindex="-1">
    <slot></slot>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useAccessibility, useScreenReader, useFocusManagement, useKeyboardNavigation } from '@/composables/useAccessibility'
import AccessibilitySettings from './AccessibilitySettings.vue'

interface Props {
  showAccessibilityBar?: boolean
  showKeyboardIndicator?: boolean
  testMode?: boolean
  pageTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  showAccessibilityBar: false,
  showKeyboardIndicator: true,
  testMode: false,
  pageTitle: ''
})

const emit = defineEmits<{
  'accessibility-change': [settings: AccessibilitySettings]
}>()

interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  focusVisible: boolean
  fontSize: number
}

// 使用 composables
const { isHighContrastMode, isReducedMotion, focusRing } = useAccessibility()
const { announce } = useScreenReader()
const { focusedElement, setFocus } = useFocusManagement()

// 響應式狀態
const showSettings = ref(false)
const isKeyboardNavigation = ref(false)
const currentFocusedElement = ref<string>('')
const currentAriaLabel = ref<string>('')
const currentRole = ref<string>('')

// 設定狀態
const settings = reactive<AccessibilitySettings>({
  highContrast: false,
  reducedMotion: false,
  focusVisible: true,
  fontSize: 16
})

// 頁面結構（自動檢測標題）
const pageStructure = ref<Array<{ id: string; title: string; level: number }>>([])

// 鍵盤導航處理
const keyboardNavigation = useKeyboardNavigation({
  onEscape: () => {
    if (showSettings.value) {
      showSettings.value = false
      announce('設定面板已關閉', 'polite')
    }
  }
})

// 跳到主內容
const skipToMain = () => {
  const mainContent = document.getElementById('main-content')
  if (mainContent) {
    setFocus(mainContent)
    announce('已跳到主要內容', 'polite')
  }
}

// 設定更新
const updateSettings = (newSettings: AccessibilitySettings) => {
  Object.assign(settings, newSettings)
  applySettings()
  emit('accessibility-change', newSettings)
}

// 切換函數
const toggleHighContrast = () => {
  settings.highContrast = !settings.highContrast
  applySettings()
  announce(
    `高對比度模式${settings.highContrast ? '已開啟' : '已關閉'}`,
    'assertive'
  )
}

const toggleReducedMotion = () => {
  settings.reducedMotion = !settings.reducedMotion
  applySettings()
  announce(
    `動畫效果${settings.reducedMotion ? '已減少' : '已恢復'}`,
    'polite'
  )
}

const increaseFontSize = () => {
  if (settings.fontSize < 24) {
    settings.fontSize += 2
    applySettings()
    announce(`字體大小已增加到 ${settings.fontSize}px`, 'polite')
  }
}

const decreaseFontSize = () => {
  if (settings.fontSize > 12) {
    settings.fontSize -= 2
    applySettings()
    announce(`字體大小已減少到 ${settings.fontSize}px`, 'polite')
  }
}

// 隱藏工具列
const hideAccessibilityBar = () => {
  // 這應該由父組件處理
  announce('無障礙工具列已隱藏。您可以按 Alt+A 重新顯示。', 'polite')
}

// 應用設定
const applySettings = () => {
  const root = document.documentElement

  // 高對比度
  root.classList.toggle('high-contrast', settings.highContrast)
  
  // 減少動畫
  root.classList.toggle('reduced-motion', settings.reducedMotion)
  
  // 焦點環
  root.classList.toggle('focus-visible-enabled', settings.focusVisible)
  
  // 字體大小
  root.style.setProperty('--font-size-base', `${settings.fontSize}px`)
}

// 檢測鍵盤導航
const detectKeyboardNavigation = () => {
  let isKeyboard = false

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      isKeyboard = true
      isKeyboardNavigation.value = true
      document.body.classList.add('user-is-tabbing')
    }
  }

  const onMouseDown = () => {
    isKeyboard = false
    isKeyboardNavigation.value = false
    document.body.classList.remove('user-is-tabbing')
  }

  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('mousedown', onMouseDown)

  return () => {
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('mousedown', onMouseDown)
  }
}

// 追蹤焦點元素（測試模式）
const trackFocusedElement = () => {
  const updateFocusedElement = () => {
    const activeElement = document.activeElement as HTMLElement
    
    if (activeElement && activeElement !== document.body) {
      currentFocusedElement.value = activeElement.tagName.toLowerCase()
      currentAriaLabel.value = activeElement.getAttribute('aria-label') || 
                               activeElement.getAttribute('aria-labelledby') || ''
      currentRole.value = activeElement.getAttribute('role') || activeElement.tagName.toLowerCase()
    } else {
      currentFocusedElement.value = ''
      currentAriaLabel.value = ''
      currentRole.value = ''
    }
  }

  document.addEventListener('focusin', updateFocusedElement)
  document.addEventListener('focusout', updateFocusedElement)

  return () => {
    document.removeEventListener('focusin', updateFocusedElement)
    document.removeEventListener('focusout', updateFocusedElement)
  }
}

// 掃描頁面結構
const scanPageStructure = () => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  pageStructure.value = Array.from(headings).map((heading, index) => {
    const level = parseInt(heading.tagName.substring(1))
    let id = heading.id
    
    if (!id) {
      id = `heading-${index}`
      heading.id = id
    }
    
    return {
      id,
      title: heading.textContent || '',
      level
    }
  })
}

// 全域鍵盤快捷鍵
const setupGlobalShortcuts = () => {
  const onKeyDown = (event: KeyboardEvent) => {
    // Alt + A: 顯示/隱藏無障礙工具列
    if (event.altKey && event.key === 'a') {
      event.preventDefault()
      // 這應該由父組件處理
      announce('無障礙工具列快捷鍵已觸發', 'polite')
    }
    
    // Alt + S: 跳到搜尋
    if (event.altKey && event.key === 's') {
      event.preventDefault()
      const searchInput = document.querySelector('input[type="search"], [role="search"] input') as HTMLElement
      if (searchInput) {
        setFocus(searchInput)
        announce('已跳到搜尋', 'polite')
      }
    }
    
    // Alt + M: 跳到主內容
    if (event.altKey && event.key === 'm') {
      event.preventDefault()
      skipToMain()
    }
    
    // Alt + N: 跳到導航
    if (event.altKey && event.key === 'n') {
      event.preventDefault()
      const nav = document.querySelector('nav, [role="navigation"]') as HTMLElement
      if (nav) {
        const firstLink = nav.querySelector('a, button') as HTMLElement
        if (firstLink) {
          setFocus(firstLink)
          announce('已跳到導航', 'polite')
        }
      }
    }
  }

  document.addEventListener('keydown', onKeyDown)
  
  return () => {
    document.removeEventListener('keydown', onKeyDown)
  }
}

// 初始化
let cleanupFunctions: (() => void)[] = []

onMounted(() => {
  // 載入儲存的設定
  try {
    const saved = localStorage.getItem('accessibility-settings')
    if (saved) {
      Object.assign(settings, JSON.parse(saved))
    }
  } catch (error) {
    console.warn('Failed to load accessibility settings:', error)
  }

  // 檢測系統偏好
  if (isHighContrastMode.value) {
    settings.highContrast = true
  }
  if (isReducedMotion.value) {
    settings.reducedMotion = true
  }

  applySettings()
  
  // 設定各種功能
  cleanupFunctions.push(
    detectKeyboardNavigation(),
    trackFocusedElement(),
    setupGlobalShortcuts()
  )
  
  // 掃描頁面結構
  nextTick(() => {
    scanPageStructure()
  })
  
  // 設定鍵盤導航監聽
  keyboardNavigation.startListening()
  
  // 公告頁面載入完成
  setTimeout(() => {
    const title = props.pageTitle || document.title || '頁面'
    announce(`${title} 已載入完成`, 'polite')
  }, 1000)
})

onUnmounted(() => {
  // 清理所有事件監聽器
  cleanupFunctions.forEach(cleanup => cleanup())
  keyboardNavigation.stopListening()
})
</script>

<style scoped>
/* 跳到主內容連結樣式 */
.skip-to-main {
  transform: translateY(-100%);
  transition: transform 0.3s;
}

.skip-to-main:focus {
  transform: translateY(0%);
}

/* 螢幕閱讀器專用樣式 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 焦點可見時移除 sr-only */
.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* 鍵盤導航用戶的焦點增強 */
:global(.user-is-tabbing) *:focus {
  outline: 3px solid #4f46e5 !important;
  outline-offset: 2px !important;
}

/* 高對比度模式樣式 */
:global(.high-contrast) {
  filter: contrast(150%);
}

:global(.high-contrast) * {
  text-shadow: none !important;
  box-shadow: none !important;
}

/* 減少動畫樣式 */
:global(.reduced-motion),
:global(.reduced-motion) *,
:global(.reduced-motion) *:before,
:global(.reduced-motion) *:after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

/* 焦點環增強 */
:global(.focus-visible-enabled) button:focus,
:global(.focus-visible-enabled) a:focus,
:global(.focus-visible-enabled) input:focus,
:global(.focus-visible-enabled) select:focus,
:global(.focus-visible-enabled) textarea:focus {
  outline: 3px solid #4f46e5 !important;
  outline-offset: 2px !important;
}

/* 無障礙工具列動畫 */
.accessibility-bar {
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out;
}

.accessibility-bar:focus-within,
.accessibility-bar:hover {
  transform: translateY(0);
}

/* 鍵盤導航指示器 */
.keyboard-indicator {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 測試模式面板 */
.accessibility-test {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>