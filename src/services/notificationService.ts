/**
 * 即時通知服務
 * 提供多種通知方式的統一管理
 */

export interface NotificationConfig {
  // 瀏覽器推播通知
  browserNotifications: {
    enabled: boolean
    permission: NotificationPermission
    sound: boolean
    vibration: boolean
    badge: boolean
  }
  
  // 電子郵件通知
  emailNotifications: {
    enabled: boolean
    events: string[]
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  }
  
  // 應用內通知
  inAppNotifications: {
    enabled: boolean
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    autoHide: boolean
    duration: number
    sound: boolean
  }
  
  // WebSocket 即時通知
  realTimeNotifications: {
    enabled: boolean
    reconnectInterval: number
    maxReconnectAttempts: number
  }
  
  // 通知過濾
  filters: {
    categories: string[]
    keywords: string[]
    priority: ('low' | 'medium' | 'high' | 'critical')[]
    timeRange: {
      start: string // HH:mm
      end: string   // HH:mm
    }
    enableDND: boolean // Do Not Disturb
    dndSchedule: Array<{
      day: number // 0=Sunday, 6=Saturday
      start: string
      end: string
    }>
  }
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  icon?: string
  image?: string
  actions?: Array<{
    id: string
    title: string
    icon?: string
  }>
  data?: Record<string, any>
  timestamp: Date
  read: boolean
  persistent: boolean
  expiresAt?: Date
  source: 'system' | 'user' | 'external'
  userId?: string
  relatedEntity?: {
    type: string
    id: string
  }
}

export interface NotificationTemplate {
  id: string
  name: string
  category: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high' | 'critical'
  variables: string[]
  enabled: boolean
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  byPriority: Record<string, number>
  recentActivity: Array<{
    date: string
    count: number
  }>
}

export interface WebSocketMessage {
  type: 'notification' | 'status' | 'ping' | 'pong'
  data?: any
  timestamp: Date
}

/**
 * 即時通知服務類別
 */
export class NotificationService {
  private config: NotificationConfig
  private notifications: Map<string, Notification> = new Map()
  private templates: Map<string, NotificationTemplate> = new Map()
  private observers: Map<string, (notification: Notification) => void> = new Map()
  private websocket: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private isConnected = false

  constructor() {
    this.config = this.getDefaultConfig()
    this.loadConfig()
    this.loadNotifications()
    this.loadTemplates()
    this.initializeBrowserNotifications()
    this.startWebSocketConnection()
  }

  /**
   * 取得預設配置
   */
  private getDefaultConfig(): NotificationConfig {
    return {
      browserNotifications: {
        enabled: true,
        permission: 'default',
        sound: true,
        vibration: true,
        badge: true
      },
      emailNotifications: {
        enabled: false,
        events: [],
        frequency: 'immediate'
      },
      inAppNotifications: {
        enabled: true,
        position: 'top-right',
        autoHide: true,
        duration: 5000,
        sound: true
      },
      realTimeNotifications: {
        enabled: true,
        reconnectInterval: 5000,
        maxReconnectAttempts: 5
      },
      filters: {
        categories: [],
        keywords: [],
        priority: ['low', 'medium', 'high', 'critical'],
        timeRange: {
          start: '00:00',
          end: '23:59'
        },
        enableDND: false,
        dndSchedule: []
      }
    }
  }

  /**
   * 載入配置
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('notification-config')
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Failed to load notification config:', error)
    }
  }

  /**
   * 儲存配置
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('notification-config', JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save notification config:', error)
    }
  }

  /**
   * 載入通知
   */
  private loadNotifications(): void {
    try {
      const saved = localStorage.getItem('notifications')
      if (saved) {
        const notifications = JSON.parse(saved)
        for (const notification of notifications) {
          notification.timestamp = new Date(notification.timestamp)
          if (notification.expiresAt) {
            notification.expiresAt = new Date(notification.expiresAt)
          }
          this.notifications.set(notification.id, notification)
        }
      }
    } catch (error) {
      console.warn('Failed to load notifications:', error)
    }
  }

  /**
   * 儲存通知
   */
  private saveNotifications(): void {
    try {
      const notifications = Array.from(this.notifications.values())
      localStorage.setItem('notifications', JSON.stringify(notifications))
    } catch (error) {
      console.warn('Failed to save notifications:', error)
    }
  }

  /**
   * 載入通知範本
   */
  private loadTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'task-reminder',
        name: '任務提醒',
        category: 'task',
        title: '任務提醒：{taskTitle}',
        message: '您有一個任務 "{taskTitle}" 即將到期',
        type: 'warning',
        priority: 'medium',
        variables: ['taskTitle'],
        enabled: true
      },
      {
        id: 'calendar-event',
        name: '行事曆提醒',
        category: 'calendar',
        title: '會議提醒：{eventTitle}',
        message: '您有一個會議 "{eventTitle}" 將在 {timeUntil} 後開始',
        type: 'info',
        priority: 'high',
        variables: ['eventTitle', 'timeUntil'],
        enabled: true
      },
      {
        id: 'system-update',
        name: '系統更新',
        category: 'system',
        title: '系統更新',
        message: '{updateMessage}',
        type: 'info',
        priority: 'low',
        variables: ['updateMessage'],
        enabled: true
      },
      {
        id: 'sync-completed',
        name: '同步完成',
        category: 'sync',
        title: '同步完成',
        message: '{syncType} 同步已完成，處理了 {count} 個項目',
        type: 'success',
        priority: 'medium',
        variables: ['syncType', 'count'],
        enabled: true
      },
      {
        id: 'error-occurred',
        name: '錯誤發生',
        category: 'error',
        title: '發生錯誤',
        message: '操作失敗：{errorMessage}',
        type: 'error',
        priority: 'high',
        variables: ['errorMessage'],
        enabled: true
      }
    ]

    try {
      const saved = localStorage.getItem('notification-templates')
      if (saved) {
        const templates = JSON.parse(saved)
        for (const template of templates) {
          this.templates.set(template.id, template)
        }
      } else {
        for (const template of defaultTemplates) {
          this.templates.set(template.id, template)
        }
        this.saveTemplates()
      }
    } catch (error) {
      console.warn('Failed to load notification templates:', error)
      for (const template of defaultTemplates) {
        this.templates.set(template.id, template)
      }
    }
  }

  /**
   * 儲存通知範本
   */
  private saveTemplates(): void {
    try {
      const templates = Array.from(this.templates.values())
      localStorage.setItem('notification-templates', JSON.stringify(templates))
    } catch (error) {
      console.warn('Failed to save notification templates:', error)
    }
  }

  /**
   * 初始化瀏覽器通知
   */
  private async initializeBrowserNotifications(): Promise<void> {
    if ('Notification' in window) {
      this.config.browserNotifications.permission = Notification.permission

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        this.config.browserNotifications.permission = permission
        this.saveConfig()
      }
    }
  }

  /**
   * 啟動 WebSocket 連線
   */
  private startWebSocketConnection(): void {
    if (!this.config.realTimeNotifications.enabled) {
      return
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'

    try {
      this.websocket = new WebSocket(wsUrl)

      this.websocket.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.clearReconnectTimer()
      }

      this.websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleWebSocketMessage(message)
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error)
        }
      }

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.scheduleReconnect()
      }

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnected = false
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.scheduleReconnect()
    }
  }

  /**
   * 處理 WebSocket 訊息
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'notification':
        if (message.data) {
          this.addNotification(message.data)
        }
        break
      case 'ping':
        this.sendWebSocketMessage({ type: 'pong', timestamp: new Date() })
        break
      default:
        break
    }
  }

  /**
   * 發送 WebSocket 訊息
   */
  private sendWebSocketMessage(message: WebSocketMessage): void {
    if (this.websocket && this.isConnected) {
      try {
        this.websocket.send(JSON.stringify(message))
      } catch (error) {
        console.warn('Failed to send WebSocket message:', error)
      }
    }
  }

  /**
   * 排程重新連線
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.realTimeNotifications.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached')
      return
    }

    this.clearReconnectTimer()
    this.reconnectAttempts++

    const delay = Math.min(
      this.config.realTimeNotifications.reconnectInterval * this.reconnectAttempts,
      30000
    )

    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.realTimeNotifications.maxReconnectAttempts})`)
      this.startWebSocketConnection()
    }, delay)
  }

  /**
   * 清除重新連線計時器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * 新增通知
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const fullNotification: Notification = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification
    }

    // 檢查是否通過篩選
    if (!this.shouldShowNotification(fullNotification)) {
      return id
    }

    this.notifications.set(id, fullNotification)
    this.saveNotifications()

    // 觸發各種通知方式
    this.triggerNotifications(fullNotification)

    // 通知觀察者
    this.notifyObservers(fullNotification)

    return id
  }

  /**
   * 使用範本建立通知
   */
  addNotificationFromTemplate(
    templateId: string,
    variables: Record<string, string>,
    overrides?: Partial<Notification>
  ): string | null {
    const template = this.templates.get(templateId)
    if (!template || !template.enabled) {
      return null
    }

    let title = template.title
    let message = template.message

    // 替換變數
    for (const [key, value] of Object.entries(variables)) {
      title = title.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }

    return this.addNotification({
      type: template.type,
      category: template.category,
      priority: template.priority,
      title,
      message,
      source: 'system',
      ...overrides
    })
  }

  /**
   * 檢查是否應該顯示通知
   */
  private shouldShowNotification(notification: Notification): boolean {
    const filters = this.config.filters

    // 檢查類別篩選
    if (filters.categories.length > 0 && !filters.categories.includes(notification.category)) {
      return false
    }

    // 檢查優先級篩選
    if (!filters.priority.includes(notification.priority)) {
      return false
    }

    // 檢查關鍵字篩選
    if (filters.keywords.length > 0) {
      const content = `${notification.title} ${notification.message}`.toLowerCase()
      const hasKeyword = filters.keywords.some(keyword =>
        content.includes(keyword.toLowerCase())
      )
      if (!hasKeyword) {
        return false
      }
    }

    // 檢查時間範圍
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    if (currentTime < filters.timeRange.start || currentTime > filters.timeRange.end) {
      return false
    }

    // 檢查勿擾模式
    if (filters.enableDND) {
      const currentDay = now.getDay()
      const dndRule = filters.dndSchedule.find(rule => rule.day === currentDay)
      
      if (dndRule && currentTime >= dndRule.start && currentTime <= dndRule.end) {
        return false
      }
    }

    return true
  }

  /**
   * 觸發各種通知方式
   */
  private triggerNotifications(notification: Notification): void {
    // 瀏覽器通知
    if (this.config.browserNotifications.enabled &&
        this.config.browserNotifications.permission === 'granted') {
      this.showBrowserNotification(notification)
    }

    // 應用內通知
    if (this.config.inAppNotifications.enabled) {
      this.showInAppNotification(notification)
    }

    // 播放聲音
    if ((this.config.browserNotifications.sound || this.config.inAppNotifications.sound) &&
        notification.priority !== 'low') {
      this.playNotificationSound(notification.type)
    }

    // 震動
    if (this.config.browserNotifications.vibration && 'navigator' in window && 'vibrate' in navigator) {
      const pattern = this.getVibrationPattern(notification.priority)
      navigator.vibrate(pattern)
    }
  }

  /**
   * 顯示瀏覽器通知
   */
  private showBrowserNotification(notification: Notification): void {
    const options: NotificationOptions = {
      body: notification.message,
      icon: notification.icon || '/favicon.ico',
      image: notification.image,
      badge: '/favicon.ico',
      tag: notification.category,
      requireInteraction: notification.priority === 'critical',
      silent: !this.config.browserNotifications.sound
    }

    if (notification.actions) {
      options.actions = notification.actions.map(action => ({
        action: action.id,
        title: action.title,
        icon: action.icon
      }))
    }

    try {
      const browserNotification = new Notification(notification.title, options)
      
      browserNotification.onclick = () => {
        this.markAsRead(notification.id)
        browserNotification.close()
        
        // 觸發點擊事件
        this.handleNotificationClick(notification)
      }

      // 自動關閉
      if (notification.priority !== 'critical') {
        setTimeout(() => {
          browserNotification.close()
        }, this.config.inAppNotifications.duration)
      }
    } catch (error) {
      console.warn('Failed to show browser notification:', error)
    }
  }

  /**
   * 顯示應用內通知
   */
  private showInAppNotification(notification: Notification): void {
    // 這裡應該觸發 Vue 組件顯示通知
    // 可以使用事件總線或狀態管理
    const event = new CustomEvent('show-in-app-notification', {
      detail: notification
    })
    window.dispatchEvent(event)
  }

  /**
   * 播放通知聲音
   */
  private playNotificationSound(type: string): void {
    try {
      const audio = new Audio()
      
      switch (type) {
        case 'success':
          audio.src = '/sounds/success.mp3'
          break
        case 'warning':
          audio.src = '/sounds/warning.mp3'
          break
        case 'error':
          audio.src = '/sounds/error.mp3'
          break
        default:
          audio.src = '/sounds/notification.mp3'
          break
      }

      audio.volume = 0.5
      audio.play().catch(() => {
        // 忽略播放失敗（可能是使用者互動限制）
      })
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }

  /**
   * 取得震動模式
   */
  private getVibrationPattern(priority: string): number[] {
    switch (priority) {
      case 'critical':
        return [100, 50, 100, 50, 100]
      case 'high':
        return [200, 100, 200]
      case 'medium':
        return [100, 50, 100]
      case 'low':
      default:
        return [50]
    }
  }

  /**
   * 處理通知點擊
   */
  private handleNotificationClick(notification: Notification): void {
    // 可以根據通知類型或相關實體導航到特定頁面
    if (notification.relatedEntity) {
      const event = new CustomEvent('navigate-to-entity', {
        detail: notification.relatedEntity
      })
      window.dispatchEvent(event)
    }
  }

  /**
   * 標記為已讀
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId)
    if (notification) {
      notification.read = true
      this.saveNotifications()
    }
  }

  /**
   * 標記全部為已讀
   */
  markAllAsRead(): void {
    for (const notification of this.notifications.values()) {
      notification.read = true
    }
    this.saveNotifications()
  }

  /**
   * 刪除通知
   */
  deleteNotification(notificationId: string): void {
    this.notifications.delete(notificationId)
    this.saveNotifications()
  }

  /**
   * 清空所有通知
   */
  clearAllNotifications(): void {
    this.notifications.clear()
    this.saveNotifications()
  }

  /**
   * 取得通知列表
   */
  getNotifications(options: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
    category?: string
    priority?: string[]
  } = {}): Notification[] {
    let notifications = Array.from(this.notifications.values())

    // 過濾未讀
    if (options.unreadOnly) {
      notifications = notifications.filter(n => !n.read)
    }

    // 按類別過濾
    if (options.category) {
      notifications = notifications.filter(n => n.category === options.category)
    }

    // 按優先級過濾
    if (options.priority && options.priority.length > 0) {
      notifications = notifications.filter(n => options.priority!.includes(n.priority))
    }

    // 排序（最新的在前）
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // 分頁
    if (options.offset) {
      notifications = notifications.slice(options.offset)
    }
    if (options.limit) {
      notifications = notifications.slice(0, options.limit)
    }

    return notifications
  }

  /**
   * 取得通知統計
   */
  getStats(): NotificationStats {
    const notifications = Array.from(this.notifications.values())
    
    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {},
      byCategory: {},
      byPriority: {},
      recentActivity: []
    }

    // 按類型統計
    for (const notification of notifications) {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
      stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1
    }

    // 最近活動（過去7天）
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const count = notifications.filter(n => 
        n.timestamp.toISOString().split('T')[0] === dateStr
      ).length

      stats.recentActivity.push({ date: dateStr, count })
    }

    return stats
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config }
    this.saveConfig()

    // 重新啟動 WebSocket 連線（如果設定改變）
    if (config.realTimeNotifications) {
      if (this.websocket) {
        this.websocket.close()
      }
      this.startWebSocketConnection()
    }
  }

  /**
   * 取得配置
   */
  getConfig(): NotificationConfig {
    return { ...this.config }
  }

  /**
   * 訂閱通知事件
   */
  subscribe(observerId: string, callback: (notification: Notification) => void): void {
    this.observers.set(observerId, callback)
  }

  /**
   * 取消訂閱
   */
  unsubscribe(observerId: string): void {
    this.observers.delete(observerId)
  }

  /**
   * 通知觀察者
   */
  private notifyObservers(notification: Notification): void {
    for (const callback of this.observers.values()) {
      try {
        callback(notification)
      } catch (error) {
        console.warn('Error in notification observer:', error)
      }
    }
  }

  /**
   * 取得通知範本
   */
  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * 更新通知範本
   */
  updateTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template)
    this.saveTemplates()
  }

  /**
   * 清理過期通知
   */
  cleanupExpiredNotifications(): void {
    const now = new Date()
    const toDelete: string[] = []

    for (const [id, notification] of this.notifications) {
      if (notification.expiresAt && notification.expiresAt < now) {
        toDelete.push(id)
      }
    }

    for (const id of toDelete) {
      this.notifications.delete(id)
    }

    if (toDelete.length > 0) {
      this.saveNotifications()
    }
  }

  /**
   * 銷毀服務
   */
  destroy(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }

    this.clearReconnectTimer()
    this.observers.clear()
  }
}

// 全域服務實例
export const notificationService = new NotificationService()

// 便利函數
export function useNotifications() {
  return notificationService
}

// 便利函數：快速發送通知
export function notify(
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  options?: Partial<Notification>
) {
  return notificationService.addNotification({
    type,
    category: 'general',
    priority: type === 'error' ? 'high' : 'medium',
    title,
    message,
    source: 'user',
    persistent: false,
    ...options
  })
}