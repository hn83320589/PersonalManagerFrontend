<template>
  <div class="accessibility-guide" role="region" aria-labelledby="guide-title">
    <!-- 標題區域 -->
    <div class="guide-header mb-6">
      <h2 id="guide-title" class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        無障礙使用指南
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        了解如何更好地使用本網站的無障礙功能
      </p>
    </div>

    <!-- 快速導航 -->
    <nav class="guide-navigation mb-8" aria-labelledby="guide-nav-title">
      <h3 id="guide-nav-title" class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        快速導航
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          @click="scrollToSection(section.id)"
          class="text-left p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          :aria-describedby="`${section.id}-desc`"
        >
          <div class="flex items-center space-x-3">
            <component :is="section.icon" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ section.title }}
              </div>
              <div :id="`${section.id}-desc`" class="text-sm text-gray-600 dark:text-gray-400">
                {{ section.description }}
              </div>
            </div>
          </div>
        </button>
      </div>
    </nav>

    <!-- 內容區域 -->
    <div class="guide-content space-y-12">
      <!-- 鍵盤導航 -->
      <section :id="sections[0].id" class="guide-section">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {{ sections[0].title }}
        </h3>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">主要快捷鍵</h4>
          <div class="space-y-3">
            <div v-for="shortcut in keyboardShortcuts" :key="shortcut.key" class="flex justify-between items-center">
              <div class="flex items-center space-x-3">
                <kbd class="px-2 py-1 text-sm font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                  {{ shortcut.key }}
                </kbd>
                <span class="text-gray-700 dark:text-gray-300">{{ shortcut.description }}</span>
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ shortcut.context }}</span>
            </div>
          </div>
        </div>
        
        <div class="mt-6">
          <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">導航技巧</h4>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400">
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>使用 Tab 鍵在可互動元素間移動</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>使用 Shift + Tab 向後導航</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>使用方向鍵在選單項目間移動</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>按 Enter 或 Space 鍵啟動按鈕和連結</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- 螢幕閱讀器 -->
      <section :id="sections[1].id" class="guide-section">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {{ sections[1].title }}
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h4 class="font-medium text-green-900 dark:text-green-100 mb-3">
              支援的螢幕閱讀器
            </h4>
            <ul class="space-y-2 text-green-800 dark:text-green-200">
              <li v-for="reader in screenReaders" :key="reader.name" class="flex items-center space-x-2">
                <CheckIcon class="w-4 h-4" />
                <span>{{ reader.name }}</span>
                <span class="text-sm opacity-75">({{ reader.platform }})</span>
              </li>
            </ul>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-3">
              最佳實踐建議
            </h4>
            <ul class="space-y-2 text-blue-800 dark:text-blue-200">
              <li v-for="practice in screenReaderPractices" :key="practice" class="flex items-start space-x-2">
                <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>{{ practice }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">地標導航</h4>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            本網站使用語意化標籤和 ARIA 地標，方便螢幕閱讀器用戶快速導航：
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="landmark in landmarks" :key="landmark.tag" class="flex items-center space-x-3">
              <code class="px-2 py-1 text-sm bg-white dark:bg-gray-700 rounded">{{ landmark.tag }}</code>
              <span class="text-gray-600 dark:text-gray-400">{{ landmark.description }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 視覺輔助 -->
      <section :id="sections[2].id" class="guide-section">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {{ sections[2].title }}
        </h3>

        <div class="space-y-6">
          <!-- 高對比度模式 -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-medium text-gray-900 dark:text-gray-100">高對比度模式</h4>
              <button
                type="button"
                @click="toggleHighContrast"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  highContrastDemo ? 'bg-blue-600' : 'bg-gray-200'
                ]"
                role="switch"
                :aria-checked="highContrastDemo"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    highContrastDemo ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
                <span class="sr-only">切換高對比度模式示範</span>
              </button>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              高對比度模式增強文字和背景的對比度，改善視覺辨識度。
            </p>
            <div 
              :class="['p-4 rounded border', highContrastDemo ? 'bg-black text-white border-white' : 'bg-white text-black border-gray-300']"
            >
              <strong>示範文字：</strong>這是高對比度模式的效果展示。
            </div>
          </div>

          <!-- 字體大小調整 -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">字體大小調整</h4>
            <div class="flex items-center space-x-4 mb-4">
              <button
                type="button"
                @click="decreaseFontSize"
                :disabled="demoFontSize <= 12"
                class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                A-
              </button>
              <span class="text-gray-600 dark:text-gray-400">{{ demoFontSize }}px</span>
              <button
                type="button"
                @click="increaseFontSize"
                :disabled="demoFontSize >= 24"
                class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                A+
              </button>
            </div>
            <div class="p-4 bg-white dark:bg-gray-700 rounded border">
              <p :style="{ fontSize: demoFontSize + 'px' }">
                這是字體大小調整的示範文字。您可以根據需要調整到合適的大小。
              </p>
            </div>
          </div>

          <!-- 顏色對比 -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">顏色對比標準</h4>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              本網站遵循 WCAG 2.1 AA 級顏色對比標準：
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <h5 class="font-medium text-gray-900 dark:text-gray-100">一般文字</h5>
                <div v-for="contrast in contrastExamples.normal" :key="contrast.label" class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-sm">{{ contrast.label }}</span>
                    <span class="text-sm text-gray-500">{{ contrast.ratio }}:1</span>
                  </div>
                  <div 
                    class="p-3 rounded text-center"
                    :style="{ backgroundColor: contrast.bg, color: contrast.fg }"
                  >
                    範例文字
                  </div>
                </div>
              </div>
              <div class="space-y-3">
                <h5 class="font-medium text-gray-900 dark:text-gray-100">大字體</h5>
                <div v-for="contrast in contrastExamples.large" :key="contrast.label" class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-sm">{{ contrast.label }}</span>
                    <span class="text-sm text-gray-500">{{ contrast.ratio }}:1</span>
                  </div>
                  <div 
                    class="p-3 rounded text-center text-lg font-bold"
                    :style="{ backgroundColor: contrast.bg, color: contrast.fg }"
                  >
                    大字體範例
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 輔助技術 -->
      <section :id="sections[3].id" class="guide-section">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {{ sections[3].title }}
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">語音控制</h4>
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <MicrophoneIcon class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span class="font-medium text-purple-900 dark:text-purple-100">支援的語音指令</span>
              </div>
              <ul class="space-y-2 text-purple-800 dark:text-purple-200">
                <li v-for="command in voiceCommands" :key="command.command">
                  <strong>"{{ command.command }}"</strong> - {{ command.description }}
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">瀏覽器設定建議</h4>
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
              <div class="space-y-4">
                <div v-for="browser in browserSettings" :key="browser.name">
                  <h5 class="font-medium text-orange-900 dark:text-orange-100 mb-2">{{ browser.name }}</h5>
                  <ul class="space-y-1 text-orange-800 dark:text-orange-200 text-sm">
                    <li v-for="setting in browser.settings" :key="setting">• {{ setting }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 問題回報 -->
      <section :id="sections[4].id" class="guide-section">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {{ sections[4].title }}
        </h3>

        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
          <div class="flex items-start space-x-3">
            <ExclamationTriangleIcon class="w-6 h-6 text-red-600 dark:text-red-400 mt-1" />
            <div class="flex-1">
              <h4 class="font-medium text-red-900 dark:text-red-100 mb-2">
                遇到無障礙問題？
              </h4>
              <p class="text-red-800 dark:text-red-200 mb-4">
                如果您在使用本網站時遇到任何無障礙問題，請告訴我們。我們致力於改善所有用戶的體驗。
              </p>
              <div class="space-y-2">
                <p class="text-red-800 dark:text-red-200">
                  <strong>聯絡方式：</strong>
                </p>
                <ul class="space-y-1 text-red-700 dark:text-red-300">
                  <li>• 電子郵件：accessibility@example.com</li>
                  <li>• 電話：(02) 1234-5678</li>
                  <li>• 線上表單：<a href="/contact" class="underline hover:no-underline">聯絡我們</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">回報時請提供</h4>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400">
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>問題發生的頁面網址</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>您使用的瀏覽器和版本</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>您使用的輔助技術（如螢幕閱讀器）</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>問題的詳細描述</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>您期望的結果</span>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- 返回頂部 -->
    <div class="mt-12 text-center">
      <button
        type="button"
        @click="scrollToTop"
        class="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="返回頁面頂部"
      >
        <ChevronUpIcon class="w-5 h-5" />
        <span>返回頂部</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  CommandLineIcon,
  SpeakerWaveIcon,
  EyeIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  MicrophoneIcon,
  ChevronUpIcon
} from '@heroicons/vue/24/outline'

// 響應式狀態
const highContrastDemo = ref(false)
const demoFontSize = ref(16)

// 指南區塊
const sections = [
  {
    id: 'keyboard-navigation',
    title: '鍵盤導航',
    description: '了解如何使用鍵盤操作網站',
    icon: CommandLineIcon
  },
  {
    id: 'screen-reader',
    title: '螢幕閱讀器',
    description: '螢幕閱讀器支援和最佳實踐',
    icon: SpeakerWaveIcon
  },
  {
    id: 'visual-aids',
    title: '視覺輔助',
    description: '高對比度、字體大小等視覺設定',
    icon: EyeIcon
  },
  {
    id: 'assistive-tech',
    title: '輔助技術',
    description: '其他輔助技術的使用指南',
    icon: ComputerDesktopIcon
  },
  {
    id: 'feedback',
    title: '問題回報',
    description: '回報無障礙問題的方式',
    icon: ExclamationTriangleIcon
  }
]

// 鍵盤快捷鍵
const keyboardShortcuts = [
  { key: 'Tab', description: '移動到下一個可聚焦元素', context: '全域' },
  { key: 'Shift + Tab', description: '移動到上一個可聚焦元素', context: '全域' },
  { key: 'Enter', description: '啟動按鈕或連結', context: '互動元素' },
  { key: 'Space', description: '啟動按鈕或核取方塊', context: '按鈕/核取方塊' },
  { key: 'Escape', description: '關閉對話框或選單', context: '模態視窗' },
  { key: 'Arrow Keys', description: '在選單項目間移動', context: '選單/清單' },
  { key: 'Home', description: '移動到開始位置', context: '清單/文字' },
  { key: 'End', description: '移動到結束位置', context: '清單/文字' },
  { key: 'Alt + A', description: '顯示/隱藏無障礙工具列', context: '本網站' },
  { key: 'Alt + M', description: '跳到主要內容', context: '本網站' },
  { key: 'Alt + N', description: '跳到導航選單', context: '本網站' },
  { key: 'Alt + S', description: '跳到搜尋', context: '本網站' }
]

// 螢幕閱讀器
const screenReaders = [
  { name: 'NVDA', platform: 'Windows' },
  { name: 'JAWS', platform: 'Windows' },
  { name: 'VoiceOver', platform: 'macOS/iOS' },
  { name: 'TalkBack', platform: 'Android' },
  { name: 'Orca', platform: 'Linux' }
]

const screenReaderPractices = [
  '使用標題導航 (H1-H6) 快速瀏覽頁面結構',
  '利用地標 (landmark) 功能快速跳到不同區域',
  '使用表格導航命令瀏覽複雜資料',
  '善用快速鍵跳過重複內容',
  '啟用詳細模式獲取更多資訊'
]

// 地標說明
const landmarks = [
  { tag: '<header>', description: '頁面頭部區域' },
  { tag: '<nav>', description: '導航選單' },
  { tag: '<main>', description: '主要內容區域' },
  { tag: '<aside>', description: '側邊欄內容' },
  { tag: '<footer>', description: '頁面頁腳' },
  { tag: 'role="banner"', description: '網站橫幅' },
  { tag: 'role="search"', description: '搜尋功能' },
  { tag: 'role="complementary"', description: '補充資訊' }
]

// 顏色對比範例
const contrastExamples = {
  normal: [
    { label: 'AA 級最低標準', ratio: 4.5, bg: '#000000', fg: '#ffffff' },
    { label: 'AAA 級增強標準', ratio: 7.0, bg: '#000000', fg: '#ffffff' },
    { label: '藍色主題', ratio: 4.6, bg: '#1e40af', fg: '#ffffff' }
  ],
  large: [
    { label: 'AA 級最低標準', ratio: 3.0, bg: '#4b5563', fg: '#ffffff' },
    { label: 'AAA 級增強標準', ratio: 4.5, bg: '#1f2937', fg: '#ffffff' },
    { label: '綠色主題', ratio: 3.1, bg: '#059669', fg: '#ffffff' }
  ]
}

// 語音指令
const voiceCommands = [
  { command: '點擊按鈕名稱', description: '啟動指定按鈕' },
  { command: '點擊連結文字', description: '點擊指定連結' },
  { command: '向下滾動', description: '向下捲動頁面' },
  { command: '向上滾動', description: '向上捲動頁面' },
  { command: '顯示數字', description: '顯示頁面元素編號' },
  { command: '說數字', description: '點擊對應編號的元素' }
]

// 瀏覽器設定建議
const browserSettings = [
  {
    name: 'Chrome',
    settings: [
      '啟用「設定 > 進階 > 無障礙設定」',
      '使用「Chrome://flags」啟用實驗性無障礙功能',
      '安裝 ChromeVox 擴充功能'
    ]
  },
  {
    name: 'Firefox',
    settings: [
      '啟用「設定 > 一般 > 無障礙設定」',
      '調整「設定 > 一般 > 字型與顏色」',
      '使用「about:config」調整進階設定'
    ]
  },
  {
    name: 'Safari',
    settings: [
      '啟用「系統偏好設定 > 輔助使用 > VoiceOver」',
      '調整「Safari > 偏好設定 > 進階 > 通用設定」',
      '使用「檢視 > 文字縮放」調整字體大小'
    ]
  }
]

// 功能方法
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // 延遲設定焦點確保滾動完成
    setTimeout(() => {
      element.focus()
    }, 500)
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleHighContrast = () => {
  highContrastDemo.value = !highContrastDemo.value
}

const increaseFontSize = () => {
  if (demoFontSize.value < 24) {
    demoFontSize.value += 2
  }
}

const decreaseFontSize = () => {
  if (demoFontSize.value > 12) {
    demoFontSize.value -= 2
  }
}
</script>

<style scoped>
/* 導航按鈕樣式 */
.guide-navigation button:focus {
  outline: 3px solid #4f46e5;
  outline-offset: 2px;
}

/* 段落樣式 */
.guide-section {
  scroll-margin-top: 2rem;
}

.guide-section:focus {
  outline: none;
}

/* 鍵盤快捷鍵樣式 */
kbd {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

/* 對比度示範樣式 */
.contrast-demo {
  transition: all 0.3s ease;
}

/* 返回頂部按鈕 */
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: 1rem;
    right: 1rem;
  }
}

/* 打印樣式 */
@media print {
  .guide-navigation,
  .back-to-top {
    display: none;
  }
  
  .guide-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}

/* 高對比度模式樣式 */
@media (prefers-contrast: high) {
  .guide-section {
    border: 1px solid;
    padding: 1rem;
    margin-bottom: 1rem;
  }
}

/* 減少動畫偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>