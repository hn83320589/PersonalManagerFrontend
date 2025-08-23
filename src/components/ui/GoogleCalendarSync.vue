<template>
  <div class="google-calendar-sync" role="region" aria-labelledby="sync-title">
    <!-- 標題區域 -->
    <div class="flex items-center justify-between mb-6">
      <h3 id="sync-title" class="text-lg font-medium text-gray-900 dark:text-gray-100">
        Google Calendar 同步
      </h3>
      <div class="flex items-center space-x-2">
        <div
          :class="[
            'w-3 h-3 rounded-full',
            isConnected ? 'bg-green-400' : 'bg-red-400'
          ]"
          :title="isConnected ? '已連接' : '未連接'"
        ></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ isConnected ? '已連接' : '未連接' }}
        </span>
      </div>
    </div>

    <!-- 連接狀態 -->
    <div v-if="!isConnected" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <div class="flex items-start space-x-3">
        <InformationCircleIcon class="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div class="flex-1">
          <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">
            連接 Google Calendar
          </h4>
          <p class="text-blue-800 dark:text-blue-200 mb-4">
            連接您的 Google Calendar 以同步行事曆事件，享受跨平台的日程管理體驗。
          </p>
          <button
            type="button"
            @click="connectToGoogle"
            :disabled="isConnecting"
            class="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <component
              :is="isConnecting ? 'div' : GoogleIcon"
              :class="isConnecting ? 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' : 'w-4 h-4'"
            />
            <span>{{ isConnecting ? '連接中...' : '連接 Google Calendar' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 已連接狀態 -->
    <div v-else class="space-y-6">
      <!-- 用戶資訊 -->
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img
              v-if="userInfo?.imageUrl"
              :src="userInfo.imageUrl"
              :alt="userInfo.name"
              class="w-10 h-10 rounded-full"
            />
            <div>
              <div class="font-medium text-green-900 dark:text-green-100">
                {{ userInfo?.name }}
              </div>
              <div class="text-sm text-green-700 dark:text-green-300">
                {{ userInfo?.email }}
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="disconnectFromGoogle"
            class="text-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 underline"
          >
            中斷連接
          </button>
        </div>
      </div>

      <!-- 同步設定 -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">同步設定</h4>
        
        <!-- 同步方向 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            同步方向
          </label>
          <div class="space-y-2">
            <label v-for="option in syncDirectionOptions" :key="option.value" class="flex items-center space-x-3">
              <input
                type="radio"
                :value="option.value"
                v-model="syncSettings.syncDirection"
                @change="updateSyncSettings"
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ option.label }}
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">
                  {{ option.description }}
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- 行事曆選擇 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            要同步的行事曆
          </label>
          <div v-if="availableCalendars.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
            <label
              v-for="calendar in availableCalendars"
              :key="calendar.id"
              class="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
            >
              <input
                type="checkbox"
                :value="calendar.id"
                v-model="syncSettings.selectedCalendars"
                @change="updateSyncSettings"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div class="flex items-center space-x-2 flex-1">
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: calendar.backgroundColor }"
                ></div>
                <span class="text-sm text-gray-900 dark:text-gray-100">
                  {{ calendar.summary }}
                </span>
                <span v-if="calendar.primary" class="text-xs text-blue-600 dark:text-blue-400">
                  (主要)
                </span>
              </div>
            </label>
          </div>
          <button
            v-else-if="!isLoadingCalendars"
            type="button"
            @click="loadCalendars"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            載入行事曆列表
          </button>
          <div v-if="isLoadingCalendars" class="text-sm text-gray-500 dark:text-gray-400">
            載入中...
          </div>
        </div>

        <!-- 自動同步 -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              自動同步
            </label>
            <button
              type="button"
              @click="toggleAutoSync"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                syncSettings.autoSync ? 'bg-blue-600' : 'bg-gray-200'
              ]"
              role="switch"
              :aria-checked="syncSettings.autoSync.toString()"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  syncSettings.autoSync ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
          
          <div v-if="syncSettings.autoSync" class="mt-3">
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              同步間隔 (分鐘)
            </label>
            <select
              v-model="syncSettings.syncInterval"
              @change="updateSyncSettings"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="5">5 分鐘</option>
              <option value="15">15 分鐘</option>
              <option value="30">30 分鐘</option>
              <option value="60">1 小時</option>
              <option value="180">3 小時</option>
              <option value="360">6 小時</option>
            </select>
          </div>
        </div>

        <!-- 衝突處理 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            衝突處理方式
          </label>
          <select
            v-model="syncSettings.conflictResolution"
            @change="updateSyncSettings"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="manual">手動解決</option>
            <option value="google">優先 Google Calendar</option>
            <option value="local">優先本地資料</option>
          </select>
        </div>
      </div>

      <!-- 同步操作 -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-4">同步操作</h4>
        
        <div class="flex flex-wrap gap-3 mb-4">
          <button
            type="button"
            @click="performManualSync"
            :disabled="isSyncing"
            class="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <component
              :is="isSyncing ? 'div' : ArrowPathIcon"
              :class="isSyncing ? 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' : 'w-4 h-4'"
            />
            <span>{{ isSyncing ? '同步中...' : '立即同步' }}</span>
          </button>

          <button
            type="button"
            @click="showSyncHistory = true"
            class="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ClockIcon class="w-4 h-4" />
            <span>同步歷史</span>
          </button>

          <button
            type="button"
            @click="exportSyncReport"
            class="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DocumentArrowDownIcon class="w-4 h-4" />
            <span>匯出報告</span>
          </button>
        </div>

        <!-- 同步統計 -->
        <div v-if="syncStats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ lastSyncResult?.imported || 0 }}
            </div>
            <div class="text-sm text-blue-800 dark:text-blue-200">匯入事件</div>
          </div>
          <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ lastSyncResult?.exported || 0 }}
            </div>
            <div class="text-sm text-green-800 dark:text-green-200">匯出事件</div>
          </div>
          <div class="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {{ lastSyncResult?.updated || 0 }}
            </div>
            <div class="text-sm text-yellow-800 dark:text-yellow-200">更新事件</div>
          </div>
          <div class="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              {{ lastSyncResult?.conflicts?.length || 0 }}
            </div>
            <div class="text-sm text-red-800 dark:text-red-200">衝突事件</div>
          </div>
        </div>

        <!-- 上次同步時間 -->
        <div v-if="syncStats?.lastSyncTime" class="mt-4 text-sm text-gray-600 dark:text-gray-400">
          上次同步：{{ formatDateTime(syncStats.lastSyncTime) }}
        </div>
      </div>

      <!-- 衝突解決 -->
      <div
        v-if="conflicts.length > 0"
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6"
      >
        <div class="flex items-center space-x-2 mb-4">
          <ExclamationTriangleIcon class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h4 class="font-medium text-yellow-900 dark:text-yellow-100">
            發現 {{ conflicts.length }} 個同步衝突
          </h4>
        </div>
        
        <div class="space-y-4 max-h-60 overflow-y-auto">
          <div
            v-for="(conflict, index) in conflicts"
            :key="index"
            class="bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4"
          >
            <div class="font-medium text-gray-900 dark:text-gray-100 mb-2">
              事件：{{ conflict.localEvent.title || conflict.googleEvent.summary }}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">本地版本</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatEventPreview(conflict.localEvent) }}
                </div>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google 版本</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatEventPreview(conflict.googleEvent) }}
                </div>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                type="button"
                @click="resolveConflict(index, 'keep-local')"
                class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                保留本地
              </button>
              <button
                type="button"
                @click="resolveConflict(index, 'keep-google')"
                class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                保留 Google
              </button>
              <button
                type="button"
                @click="resolveConflict(index, 'merge')"
                class="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                合併
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 同步歷史模態 -->
    <BaseModal
      v-if="showSyncHistory"
      @close="showSyncHistory = false"
      title="同步歷史"
      size="large"
    >
      <div class="space-y-4">
        <div
          v-for="(history, index) in syncHistory"
          :key="index"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ formatDateTime(history.timestamp) }}
            </div>
            <div
              :class="[
                'px-2 py-1 text-xs rounded-full',
                history.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]"
            >
              {{ history.success ? '成功' : '失敗' }}
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>匯入：{{ history.imported }}</div>
            <div>匯出：{{ history.exported }}</div>
            <div>更新：{{ history.updated }}</div>
            <div>衝突：{{ history.conflicts.length }}</div>
          </div>
          <div v-if="history.errors.length > 0" class="mt-2">
            <div class="text-sm text-red-600 dark:text-red-400">
              錯誤：{{ history.errors.length }} 個
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- 載入狀態 -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-gray-900 dark:text-gray-100">{{ loadingMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  DocumentArrowDownIcon
} from '@heroicons/vue/24/outline'
import { useGoogleCalendar, type GoogleCalendar, type SyncResult, type CalendarSyncSettings } from '@/services/googleCalendarService'
import BaseModal from './BaseModal.vue'

// 定義 Google 圖示組件
const GoogleIcon = {
  template: `
    <svg viewBox="0 0 24 24" class="w-4 h-4">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  `
}

// Props & Emits
interface Props {
  localEvents?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  localEvents: () => []
})

const emit = defineEmits<{
  'sync-completed': [result: SyncResult]
  'sync-error': [error: string]
  'events-updated': [events: any[]]
}>()

// 服務實例
const googleCalendar = useGoogleCalendar()

// 響應式狀態
const isConnected = ref(false)
const isConnecting = ref(false)
const isLoading = ref(false)
const isSyncing = ref(false)
const isLoadingCalendars = ref(false)
const loadingMessage = ref('')
const showSyncHistory = ref(false)

const userInfo = ref<any>(null)
const availableCalendars = ref<GoogleCalendar[]>([])
const syncSettings = reactive<CalendarSyncSettings>(googleCalendar.getSyncSettings())
const syncStats = ref<any>(null)
const lastSyncResult = ref<SyncResult | null>(null)
const conflicts = ref<any[]>([])
const syncHistory = ref<SyncResult[]>([])

// 同步方向選項
const syncDirectionOptions = [
  {
    value: 'bidirectional',
    label: '雙向同步',
    description: '本地與 Google Calendar 相互同步'
  },
  {
    value: 'import',
    label: '僅匯入',
    description: '只從 Google Calendar 匯入事件'
  },
  {
    value: 'export',
    label: '僅匯出',
    description: '只匯出事件到 Google Calendar'
  }
]

// 方法
const connectToGoogle = async () => {
  isConnecting.value = true
  loadingMessage.value = '連接 Google Calendar...'
  
  try {
    const initialized = await googleCalendar.initialize()
    if (initialized) {
      const signedIn = await googleCalendar.signIn()
      if (signedIn) {
        isConnected.value = true
        userInfo.value = googleCalendar.getUserInfo()
        await loadCalendars()
      }
    }
  } catch (error) {
    console.error('Google Calendar connection failed:', error)
    emit('sync-error', '連接 Google Calendar 失敗')
  } finally {
    isConnecting.value = false
    isLoading.value = false
  }
}

const disconnectFromGoogle = async () => {
  try {
    await googleCalendar.signOut()
    isConnected.value = false
    userInfo.value = null
    availableCalendars.value = []
    conflicts.value = []
  } catch (error) {
    console.error('Google Calendar disconnect failed:', error)
  }
}

const loadCalendars = async () => {
  if (!isConnected.value) return

  isLoadingCalendars.value = true
  try {
    availableCalendars.value = await googleCalendar.getCalendarList()
    
    // 預設選擇主要行事曆
    if (syncSettings.selectedCalendars.length === 0) {
      const primaryCalendar = availableCalendars.value.find(cal => cal.primary)
      if (primaryCalendar) {
        syncSettings.selectedCalendars = [primaryCalendar.id]
        updateSyncSettings()
      }
    }
  } catch (error) {
    console.error('Failed to load calendars:', error)
  } finally {
    isLoadingCalendars.value = false
  }
}

const updateSyncSettings = () => {
  googleCalendar.updateSyncSettings(syncSettings)
}

const toggleAutoSync = () => {
  syncSettings.autoSync = !syncSettings.autoSync
  updateSyncSettings()
}

const performManualSync = async () => {
  if (!isConnected.value || isSyncing.value) return

  isSyncing.value = true
  isLoading.value = true
  loadingMessage.value = '同步中...'

  try {
    const result = await googleCalendar.manualSync(props.localEvents)
    lastSyncResult.value = result
    
    if (result.conflicts.length > 0) {
      conflicts.value = result.conflicts
    }
    
    // 添加到歷史記錄
    syncHistory.value.unshift(result)
    if (syncHistory.value.length > 10) {
      syncHistory.value = syncHistory.value.slice(0, 10)
    }
    
    emit('sync-completed', result)
    
    if (result.success) {
      // 通知父組件更新事件
      emit('events-updated', [])
    }
  } catch (error) {
    console.error('Manual sync failed:', error)
    emit('sync-error', '同步失敗：' + error.message)
  } finally {
    isSyncing.value = false
    isLoading.value = false
  }
}

const resolveConflict = async (index: number, resolution: 'keep-local' | 'keep-google' | 'merge') => {
  const conflict = conflicts.value[index]
  if (!conflict) return

  try {
    await googleCalendar.resolveConflicts([{
      ...conflict,
      resolution
    }])
    
    // 移除已解決的衝突
    conflicts.value.splice(index, 1)
  } catch (error) {
    console.error('Failed to resolve conflict:', error)
    emit('sync-error', '解決衝突失敗：' + error.message)
  }
}

const exportSyncReport = () => {
  if (!lastSyncResult.value) return

  const report = {
    timestamp: new Date().toISOString(),
    syncResult: lastSyncResult.value,
    settings: syncSettings,
    userInfo: userInfo.value
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `google-calendar-sync-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatEventPreview = (event: any): string => {
  if (!event) return ''
  
  const time = event.startTime || event.start?.dateTime
  const timeStr = time ? new Date(time).toLocaleString('zh-TW') : ''
  const location = event.location ? ` @ ${event.location}` : ''
  
  return `${timeStr}${location}`
}

// 生命週期
onMounted(async () => {
  // 檢查是否已經初始化
  try {
    isConnected.value = googleCalendar.isAuthenticated()
    if (isConnected.value) {
      userInfo.value = googleCalendar.getUserInfo()
      await loadCalendars()
    }
    
    syncStats.value = googleCalendar.getSyncStats()
  } catch (error) {
    console.error('Failed to initialize Google Calendar sync:', error)
  }
})

onUnmounted(() => {
  // 清理資源
  googleCalendar.destroy()
})
</script>

<style scoped>
/* 同步狀態指示器 */
.sync-status {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 衝突項目樣式 */
.conflict-item {
  transition: all 0.3s ease;
}

.conflict-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 行事曆顏色指示器 */
.calendar-color {
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

/* 載入動畫 */
.loading-overlay {
  backdrop-filter: blur(4px);
}

/* 響應式調整 */
@media (max-width: 640px) {
  .sync-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sync-controls button {
    width: 100%;
  }
}

/* 深色模式適配 */
@media (prefers-color-scheme: dark) {
  .conflict-item {
    border-color: #374151;
  }
  
  .conflict-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .sync-status {
    border: 2px solid;
  }
  
  .calendar-color {
    border-width: 3px;
  }
}

/* 減少動畫偏好 */
@media (prefers-reduced-motion: reduce) {
  .sync-status,
  .conflict-item {
    animation: none;
    transition: none;
  }
}
</style>