<template>
  <div class="accessibility-settings" role="region" aria-labelledby="a11y-settings-title">
    <h3 id="a11y-settings-title" class="text-lg font-medium mb-4">
      無障礙設定
    </h3>

    <!-- 高對比度模式 -->
    <div class="setting-group mb-6">
      <div class="flex items-center justify-between">
        <label 
          for="high-contrast-toggle"
          class="flex items-center cursor-pointer"
        >
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 dark:text-gray-100">
              高對比度模式
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              提高文字和背景的對比度以改善可讀性
            </span>
          </div>
        </label>
        <button
          id="high-contrast-toggle"
          type="button"
          role="switch"
          :aria-checked="highContrast.toString()"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            highContrast ? 'bg-blue-600' : 'bg-gray-200'
          ]"
          @click="toggleHighContrast"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              highContrast ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
          <span class="sr-only">切換高對比度模式</span>
        </button>
      </div>
    </div>

    <!-- 減少動畫 -->
    <div class="setting-group mb-6">
      <div class="flex items-center justify-between">
        <label 
          for="reduced-motion-toggle"
          class="flex items-center cursor-pointer"
        >
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 dark:text-gray-100">
              減少動畫效果
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              減少或關閉動畫效果，適合對動畫敏感的使用者
            </span>
          </div>
        </label>
        <button
          id="reduced-motion-toggle"
          type="button"
          role="switch"
          :aria-checked="reducedMotion.toString()"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
          ]"
          @click="toggleReducedMotion"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              reducedMotion ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
          <span class="sr-only">切換減少動畫效果</span>
        </button>
      </div>
    </div>

    <!-- 焦點環 -->
    <div class="setting-group mb-6">
      <div class="flex items-center justify-between">
        <label 
          for="focus-ring-toggle"
          class="flex items-center cursor-pointer"
        >
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 dark:text-gray-100">
              顯示焦點環
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              在使用鍵盤導航時顯示焦點環
            </span>
          </div>
        </label>
        <button
          id="focus-ring-toggle"
          type="button"
          role="switch"
          :aria-checked="focusVisible.toString()"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            focusVisible ? 'bg-blue-600' : 'bg-gray-200'
          ]"
          @click="toggleFocusVisible"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              focusVisible ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
          <span class="sr-only">切換焦點環顯示</span>
        </button>
      </div>
    </div>

    <!-- 字體大小 -->
    <div class="setting-group mb-6">
      <label class="block font-medium text-gray-900 dark:text-gray-100 mb-2">
        字體大小
      </label>
      <div class="flex items-center space-x-4">
        <button
          type="button"
          @click="decreaseFontSize"
          :disabled="fontSize <= 12"
          class="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          aria-label="減小字體"
        >
          <span class="text-sm">A</span>
        </button>
        
        <div class="flex-1">
          <input
            id="font-size-slider"
            type="range"
            min="12"
            max="24"
            :value="fontSize"
            @input="updateFontSize($event)"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            aria-label="調整字體大小"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>小</span>
            <span>{{ fontSize }}px</span>
            <span>大</span>
          </div>
        </div>
        
        <button
          type="button"
          @click="increaseFontSize"
          :disabled="fontSize >= 24"
          class="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          aria-label="增大字體"
        >
          <span class="text-lg">A</span>
        </button>
      </div>
    </div>

    <!-- 螢幕閱讀器公告測試 -->
    <div class="setting-group mb-6">
      <label class="block font-medium text-gray-900 dark:text-gray-100 mb-2">
        螢幕閱讀器測試
      </label>
      <div class="flex space-x-2">
        <button
          type="button"
          @click="testScreenReader('polite')"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          測試禮貌公告
        </button>
        <button
          type="button"
          @click="testScreenReader('assertive')"
          class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          測試緊急公告
        </button>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
        點擊按鈕測試螢幕閱讀器公告功能（需開啟螢幕閱讀器軟體）
      </p>
    </div>

    <!-- 鍵盤導航說明 -->
    <div class="setting-group">
      <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
        鍵盤導航快捷鍵
      </h4>
      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div class="flex justify-between">
          <span>Tab / Shift+Tab</span>
          <span>前進/後退導航</span>
        </div>
        <div class="flex justify-between">
          <span>Enter / Space</span>
          <span>啟動按鈕或連結</span>
        </div>
        <div class="flex justify-between">
          <span>Escape</span>
          <span>關閉對話框或選單</span>
        </div>
        <div class="flex justify-between">
          <span>方向鍵</span>
          <span>在選單中導航</span>
        </div>
        <div class="flex justify-between">
          <span>Home / End</span>
          <span>移到開始/結束位置</span>
        </div>
      </div>
    </div>

    <!-- 狀態公告區域 -->
    <div
      id="a11y-status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAccessibility, useScreenReader } from '@/composables/useAccessibility'

interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
})

const emit = defineEmits<{
  'update:settings': [settings: AccessibilitySettings]
}>()

interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  focusVisible: boolean
  fontSize: number
}

// 使用無障礙 composables
const { isHighContrastMode, isReducedMotion, focusRing } = useAccessibility()
const { announce } = useScreenReader()

// 設定狀態
const highContrast = ref(false)
const reducedMotion = ref(false)
const focusVisible = ref(true)
const fontSize = ref(16)

// 從本地儲存載入設定
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('accessibility-settings')
    if (saved) {
      const settings = JSON.parse(saved) as AccessibilitySettings
      highContrast.value = settings.highContrast ?? false
      reducedMotion.value = settings.reducedMotion ?? false
      focusVisible.value = settings.focusVisible ?? true
      fontSize.value = settings.fontSize ?? 16
    }
  } catch (error) {
    console.warn('Failed to load accessibility settings:', error)
  }

  // 檢測系統偏好設定
  if (isHighContrastMode.value) {
    highContrast.value = true
  }
  if (isReducedMotion.value) {
    reducedMotion.value = true
  }
}

// 保存設定
const saveSettings = () => {
  const settings: AccessibilitySettings = {
    highContrast: highContrast.value,
    reducedMotion: reducedMotion.value,
    focusVisible: focusVisible.value,
    fontSize: fontSize.value
  }

  try {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
    emit('update:settings', settings)
  } catch (error) {
    console.warn('Failed to save accessibility settings:', error)
  }
}

// 應用設定到 DOM
const applySettings = () => {
  const root = document.documentElement

  // 高對比度
  if (highContrast.value) {
    root.classList.add('high-contrast')
  } else {
    root.classList.remove('high-contrast')
  }

  // 減少動畫
  if (reducedMotion.value) {
    root.classList.add('reduced-motion')
  } else {
    root.classList.remove('reduced-motion')
  }

  // 焦點環
  if (focusVisible.value) {
    root.classList.add('focus-visible-enabled')
  } else {
    root.classList.remove('focus-visible-enabled')
  }

  // 字體大小
  root.style.setProperty('--font-size-base', `${fontSize.value}px`)
}

// 切換函數
const toggleHighContrast = () => {
  highContrast.value = !highContrast.value
  announce(
    `高對比度模式${highContrast.value ? '已開啟' : '已關閉'}`,
    'polite'
  )
}

const toggleReducedMotion = () => {
  reducedMotion.value = !reducedMotion.value
  announce(
    `減少動畫效果${reducedMotion.value ? '已開啟' : '已關閉'}`,
    'polite'
  )
}

const toggleFocusVisible = () => {
  focusVisible.value = !focusVisible.value
  announce(
    `焦點環顯示${focusVisible.value ? '已開啟' : '已關閉'}`,
    'polite'
  )
}

// 字體大小調整
const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
    announce(`字體大小已增加到 ${fontSize.value}px`, 'polite')
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2
    announce(`字體大小已減少到 ${fontSize.value}px`, 'polite')
  }
}

const updateFontSize = (event: Event) => {
  const target = event.target as HTMLInputElement
  fontSize.value = parseInt(target.value)
  announce(`字體大小已調整到 ${fontSize.value}px`, 'polite')
}

// 螢幕閱讀器測試
const testScreenReader = (priority: 'polite' | 'assertive') => {
  const message = priority === 'polite' 
    ? '這是一個禮貌的螢幕閱讀器公告測試。'
    : '這是一個緊急的螢幕閱讀器公告測試！'
  
  announce(message, priority)
}

// 監聽設定變化
watch([highContrast, reducedMotion, focusVisible, fontSize], () => {
  applySettings()
  saveSettings()
}, { deep: true })

// 初始化
onMounted(() => {
  loadSettings()
  applySettings()
})
</script>

<style scoped>
/* 高對比度樣式 */
:global(.high-contrast) {
  --color-bg: #000000;
  --color-text: #ffffff;
  --color-border: #ffffff;
  --color-link: #ffff00;
  --color-link-visited: #ff00ff;
  --color-button-bg: #000080;
  --color-button-text: #ffffff;
}

:global(.high-contrast) .setting-group {
  border: 1px solid var(--color-border);
  padding: 1rem;
  margin-bottom: 1rem;
}

/* 減少動畫樣式 */
:global(.reduced-motion *) {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

/* 焦點環樣式 */
:global(.focus-visible-enabled) :focus {
  outline: 3px solid #4f46e5 !important;
  outline-offset: 2px !important;
}

:global(.focus-visible-enabled) button:focus {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.5) !important;
}

/* 字體大小應用 */
:global(body) {
  font-size: var(--font-size-base, 16px);
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

/* 滑桿樣式改善 */
input[type="range"]:focus {
  outline: 3px solid #4f46e5;
  outline-offset: 2px;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 深色主題適配 */
@media (prefers-color-scheme: dark) {
  .setting-group {
    border-color: #374151;
  }
}
</style>