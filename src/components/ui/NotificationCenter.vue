<template>
  <div class="notification-center" role="region" aria-labelledby="notification-title">
    <!-- 通知觸發按鈕 -->
    <div class="relative">
      <button
        type="button"
        @click="togglePanel"
        :aria-expanded="showPanel.toString()"
        aria-controls="notification-panel"
        class="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        :title="`通知中心 (${unreadCount} 個未讀)`"
      >
        <BellIcon class="w-6 h-6" />
        
        <!-- 未讀計數徽章 -->
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[1.25rem] h-5"
          :aria-label="`${unreadCount} 個未讀通知`"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <!-- 通知面板 -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95 translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-1"
      >
        <div
          v-if="showPanel"
          id="notification-panel"
          class="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
          role="dialog"
          aria-labelledby="notification-title"
          @click.stop
        >
          <!-- 標題列 -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 id="notification-title" class="text-lg font-medium text-gray-900 dark:text-gray-100">
              通知中心
            </h3>
            <div class="flex items-center space-x-2">
              <!-- 篩選按鈕 -->
              <button
                type="button"
                @click="showFilters = !showFilters"
                :class="[
                  'p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                  showFilters ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                ]"
                title="篩選選項"
              >
                <AdjustmentsHorizontalIcon class="w-4 h-4" />
              </button>
              
              <!-- 設定按鈕 -->
              <button
                type="button"
                @click="showSettings = true"
                class="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="通知設定"
              >
                <Cog6ToothIcon class="w-4 h-4" />
              </button>
              
              <!-- 關閉按鈕 -->
              <button
                type="button"
                @click="showPanel = false"
                class="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="關閉"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- 篩選選項 -->
          <div v-if="showFilters" class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div class="grid grid-cols-2 gap-4">
              <!-- 類型篩選 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  類型
                </label>
                <select
                  v-model="currentFilter.type"
                  @change="applyFilters"
                  class="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">全部</option>
                  <option value="info">資訊</option>
                  <option value="success">成功</option>
                  <option value="warning">警告</option>
                  <option value="error">錯誤</option>
                </select>
              </div>
              
              <!-- 優先級篩選 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  優先級
                </label>
                <select
                  v-model="currentFilter.priority"
                  @change="applyFilters"
                  class="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">全部</option>
                  <option value="critical">緊急</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>
            
            <div class="flex items-center space-x-2 mt-3">
              <input
                id="unread-only"
                type="checkbox"
                v-model="currentFilter.unreadOnly"
                @change="applyFilters"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label for="unread-only" class="text-sm text-gray-700 dark:text-gray-300">
                僅顯示未讀
              </label>
            </div>
          </div>

          <!-- 通知列表 -->
          <div class="max-h-96 overflow-y-auto">
            <div v-if="filteredNotifications.length === 0" class="p-8 text-center">
              <BellSlashIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">
                {{ currentFilter.unreadOnly ? '沒有未讀通知' : '沒有通知' }}
              </p>
            </div>
            
            <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
              <div
                v-for="notification in filteredNotifications"
                :key="notification.id"
                :class="[
                  'p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer',
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500' : ''
                ]"
                @click="handleNotificationClick(notification)"
              >
                <div class="flex items-start space-x-3">
                  <!-- 通知圖示 -->
                  <div
                    :class="[
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      getNotificationIconClass(notification)
                    ]"
                  >
                    <component :is="getNotificationIcon(notification)" class="w-4 h-4" />
                  </div>
                  
                  <!-- 通知內容 -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {{ notification.title }}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {{ notification.message }}
                        </p>
                      </div>
                      
                      <!-- 操作按鈕 -->
                      <div class="flex items-center space-x-1 ml-2">
                        <button
                          v-if="!notification.read"
                          type="button"
                          @click.stop="markAsRead(notification.id)"
                          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                          title="標記為已讀"
                        >
                          <CheckIcon class="w-3 h-3" />
                        </button>
                        
                        <button
                          type="button"
                          @click.stop="deleteNotification(notification.id)"
                          class="p-1 text-gray-400 hover:text-red-500 rounded"
                          title="刪除"
                        >
                          <XMarkIcon class="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <!-- 時間和優先級 -->
                    <div class="flex items-center space-x-2 mt-2">
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatRelativeTime(notification.timestamp) }}
                      </span>
                      
                      <span
                        v-if="notification.priority !== 'medium'"
                        :class="[
                          'px-2 py-0.5 text-xs rounded-full',
                          getPriorityClass(notification.priority)
                        ]"
                      >
                        {{ getPriorityLabel(notification.priority) }}
                      </span>
                      
                      <span class="text-xs text-gray-400 dark:text-gray-500">
                        {{ notification.category }}
                      </span>
                    </div>
                    
                    <!-- 動作按鈕 -->
                    <div v-if="notification.actions && notification.actions.length > 0" class="mt-3 flex space-x-2">
                      <button
                        v-for="action in notification.actions"
                        :key="action.id"
                        type="button"
                        @click.stop="handleActionClick(notification, action)"
                        class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        {{ action.title }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                共 {{ stats.total }} 個通知，{{ stats.unread }} 個未讀
              </div>
              
              <div class="flex space-x-2">
                <button
                  v-if="stats.unread > 0"
                  type="button"
                  @click="markAllAsRead"
                  class="px-3 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  全部已讀
                </button>
                
                <button
                  type="button"
                  @click="showClearConfirm = true"
                  class="px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  清空全部
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 應用內通知彈出 -->
    <Teleport to="body">
      <div
        v-if="inAppNotifications.length > 0"
        :class="[
          'fixed z-50 space-y-2',
          getPositionClass()
        ]"
      >
        <TransitionGroup
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 transform scale-95"
          enter-to-class="opacity-100 transform scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 transform scale-100"
          leave-to-class="opacity-0 transform scale-95"
        >
          <div
            v-for="notification in inAppNotifications"
            :key="notification.id"
            :class="[
              'max-w-sm w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden',
              getNotificationBorderClass(notification)
            ]"
            role="alert"
            :aria-live="notification.priority === 'critical' ? 'assertive' : 'polite'"
          >
            <div class="p-4">
              <div class="flex items-start space-x-3">
                <div
                  :class="[
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    getNotificationIconClass(notification)
                  ]"
                >
                  <component :is="getNotificationIcon(notification)" class="w-4 h-4" />
                </div>
                
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ notification.title }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ notification.message }}
                  </p>
                  
                  <!-- 動作按鈕 -->
                  <div v-if="notification.actions && notification.actions.length > 0" class="mt-3 flex space-x-2">
                    <button
                      v-for="action in notification.actions"
                      :key="action.id"
                      type="button"
                      @click="handleActionClick(notification, action)"
                      class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      {{ action.title }}
                    </button>
                  </div>
                </div>
                
                <button
                  type="button"
                  @click="dismissInAppNotification(notification.id)"
                  class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- 通知設定模態 -->
    <NotificationSettings
      v-if="showSettings"
      @close="showSettings = false"
      @save="handleSettingsUpdate"
    />

    <!-- 清空確認對話框 -->
    <BaseDialog
      v-if="showClearConfirm"
      title="清空所有通知"
      message="這將永久刪除所有通知，此操作無法復原。您確定要繼續嗎？"
      confirm-text="清空"
      confirm-variant="danger"
      @confirm="clearAllNotifications"
      @cancel="showClearConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  BellIcon,
  BellSlashIcon,
  XMarkIcon,
  CheckIcon,
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import { useNotifications, type Notification, type NotificationConfig } from '@/services/notificationService'
import NotificationSettings from './NotificationSettings.vue'
import BaseDialog from './BaseDialog.vue'

// 服務實例
const notificationService = useNotifications()

// 響應式狀態
const showPanel = ref(false)
const showSettings = ref(false)
const showFilters = ref(false)
const showClearConfirm = ref(false)
const notifications = ref<Notification[]>([])
const inAppNotifications = ref<Notification[]>([])
const stats = ref(notificationService.getStats())

// 篩選狀態
const currentFilter = reactive({
  type: '',
  priority: '',
  category: '',
  unreadOnly: false
})

// 計算屬性
const unreadCount = computed(() => stats.value.unread)

const filteredNotifications = computed(() => {
  return notificationService.getNotifications({
    unreadOnly: currentFilter.unreadOnly,
    limit: 50
  }).filter(notification => {
    if (currentFilter.type && notification.type !== currentFilter.type) return false
    if (currentFilter.priority && notification.priority !== currentFilter.priority) return false
    if (currentFilter.category && notification.category !== currentFilter.category) return false
    return true
  })
})

// 方法
const loadNotifications = () => {
  notifications.value = notificationService.getNotifications({ limit: 50 })
  stats.value = notificationService.getStats()
}

const togglePanel = () => {
  showPanel.value = !showPanel.value
  if (showPanel.value) {
    loadNotifications()
  }
}

const applyFilters = () => {
  loadNotifications()
}

const markAsRead = (notificationId: string) => {
  notificationService.markAsRead(notificationId)
  loadNotifications()
}

const markAllAsRead = () => {
  notificationService.markAllAsRead()
  loadNotifications()
}

const deleteNotification = (notificationId: string) => {
  notificationService.deleteNotification(notificationId)
  loadNotifications()
}

const clearAllNotifications = () => {
  notificationService.clearAllNotifications()
  loadNotifications()
  showClearConfirm.value = false
}

const handleNotificationClick = (notification: Notification) => {
  if (!notification.read) {
    markAsRead(notification.id)
  }
  
  // 根據通知類型處理點擊事件
  if (notification.relatedEntity) {
    // 導航到相關實體
    console.log('Navigate to:', notification.relatedEntity)
  }
}

const handleActionClick = (notification: Notification, action: any) => {
  console.log('Action clicked:', action.id, notification)
  // 處理動作點擊
}

const dismissInAppNotification = (notificationId: string) => {
  inAppNotifications.value = inAppNotifications.value.filter(n => n.id !== notificationId)
}

const handleSettingsUpdate = (config: NotificationConfig) => {
  notificationService.updateConfig(config)
  showSettings.value = false
}

// 樣式輔助函數
const getNotificationIcon = (notification: Notification) => {
  switch (notification.type) {
    case 'success': return CheckCircleIcon
    case 'warning': return ExclamationTriangleIcon
    case 'error': return XCircleIcon
    default: return InformationCircleIcon
  }
}

const getNotificationIconClass = (notification: Notification) => {
  switch (notification.type) {
    case 'success': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    case 'warning': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'error': return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
    default: return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
  }
}

const getNotificationBorderClass = (notification: Notification) => {
  switch (notification.type) {
    case 'success': return 'border-l-4 border-l-green-500'
    case 'warning': return 'border-l-4 border-l-yellow-500'
    case 'error': return 'border-l-4 border-l-red-500'
    default: return 'border-l-4 border-l-blue-500'
  }
}

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  }
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    critical: '緊急',
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

const getPositionClass = () => {
  const config = notificationService.getConfig()
  const position = config.inAppNotifications.position
  
  switch (position) {
    case 'top-left': return 'top-4 left-4'
    case 'top-right': return 'top-4 right-4'
    case 'bottom-left': return 'bottom-4 left-4'
    case 'bottom-right': return 'bottom-4 right-4'
    default: return 'top-4 right-4'
  }
}

const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '剛才'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (hours < 24) return `${hours} 小時前`
  if (days < 7) return `${days} 天前`
  
  return date.toLocaleDateString('zh-TW')
}

// 事件監聽
const handleInAppNotification = (event: CustomEvent) => {
  const notification = event.detail as Notification
  inAppNotifications.value.push(notification)
  
  // 自動隱藏
  const config = notificationService.getConfig()
  if (config.inAppNotifications.autoHide && notification.priority !== 'critical') {
    setTimeout(() => {
      dismissInAppNotification(notification.id)
    }, config.inAppNotifications.duration)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (showPanel.value && !target.closest('.notification-center')) {
    showPanel.value = false
  }
}

// 生命週期
onMounted(() => {
  loadNotifications()
  
  // 訂閱新通知
  notificationService.subscribe('notification-center', (notification) => {
    loadNotifications()
  })
  
  // 監聽應用內通知事件
  window.addEventListener('show-in-app-notification', handleInAppNotification)
  
  // 點擊外部關閉面板
  document.addEventListener('click', handleClickOutside)
  
  // 定期清理過期通知
  const cleanupInterval = setInterval(() => {
    notificationService.cleanupExpiredNotifications()
    loadNotifications()
  }, 60000) // 每分鐘檢查一次
  
  // 清理函數
  onUnmounted(() => {
    clearInterval(cleanupInterval)
  })
})

onUnmounted(() => {
  notificationService.unsubscribe('notification-center')
  window.removeEventListener('show-in-app-notification', handleInAppNotification)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 通知面板動畫 */
.notification-center {
  user-select: none;
}

/* 徽章脈動動畫 */
.notification-center button span {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 通知項目 hover 效果 */
.notification-item {
  transition: all 0.2s ease;
}

.notification-item:hover {
  transform: translateX(2px);
}

/* 滾動條樣式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* 深色模式滾動條 */
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
}

/* 響應式調整 */
@media (max-width: 640px) {
  #notification-panel {
    width: calc(100vw - 2rem);
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .notification-center button {
    border: 2px solid;
  }
  
  #notification-panel {
    border-width: 2px;
  }
}

/* 減少動畫偏好 */
@media (prefers-reduced-motion: reduce) {
  .notification-center button span {
    animation: none;
  }
  
  .transition {
    transition: none;
  }
}
</style>