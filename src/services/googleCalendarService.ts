/**
 * Google Calendar 整合服務
 * 提供 Google Calendar API 整合功能
 */

export interface GoogleCalendarConfig {
  clientId: string
  apiKey: string
  scope: string[]
  discoveryDoc: string
}

export interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted'
  }>
  recurrence?: string[]
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
  colorId?: string
  status?: 'confirmed' | 'tentative' | 'cancelled'
  visibility?: 'default' | 'public' | 'private' | 'confidential'
  created?: string
  updated?: string
  creator?: {
    email: string
    displayName?: string
  }
}

export interface GoogleCalendar {
  id: string
  summary: string
  description?: string
  timeZone: string
  colorId?: string
  backgroundColor?: string
  foregroundColor?: string
  selected?: boolean
  primary?: boolean
  accessRole?: 'owner' | 'reader' | 'writer' | 'freeBusyReader'
}

export interface CalendarSyncSettings {
  enabled: boolean
  syncDirection: 'import' | 'export' | 'bidirectional'
  selectedCalendars: string[]
  syncInterval: number // minutes
  conflictResolution: 'google' | 'local' | 'manual'
  defaultReminders: Array<{
    method: 'email' | 'popup'
    minutes: number
  }>
  autoSync: boolean
  lastSyncTime?: Date
}

export interface SyncResult {
  success: boolean
  imported: number
  exported: number
  updated: number
  deleted: number
  conflicts: Array<{
    localEvent: any
    googleEvent: GoogleCalendarEvent
    type: 'time' | 'title' | 'description' | 'location'
  }>
  errors: Array<{
    event: any
    error: string
  }>
  lastSyncTime: Date
}

/**
 * Google Calendar 服務類別
 */
export class GoogleCalendarService {
  private gapi: any = null
  private isInitialized = false
  private isSignedIn = false
  private config: GoogleCalendarConfig
  private syncSettings: CalendarSyncSettings
  private syncTimer: NodeJS.Timeout | null = null

  constructor(config: GoogleCalendarConfig) {
    this.config = config
    this.syncSettings = this.getDefaultSyncSettings()
    this.loadSyncSettings()
  }

  /**
   * 取得預設同步設定
   */
  private getDefaultSyncSettings(): CalendarSyncSettings {
    return {
      enabled: false,
      syncDirection: 'bidirectional',
      selectedCalendars: [],
      syncInterval: 15,
      conflictResolution: 'manual',
      defaultReminders: [
        { method: 'popup', minutes: 10 }
      ],
      autoSync: false
    }
  }

  /**
   * 載入同步設定
   */
  private loadSyncSettings(): void {
    try {
      const saved = localStorage.getItem('google-calendar-sync-settings')
      if (saved) {
        this.syncSettings = { ...this.syncSettings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Failed to load Google Calendar sync settings:', error)
    }
  }

  /**
   * 儲存同步設定
   */
  private saveSyncSettings(): void {
    try {
      localStorage.setItem('google-calendar-sync-settings', JSON.stringify(this.syncSettings))
    } catch (error) {
      console.warn('Failed to save Google Calendar sync settings:', error)
    }
  }

  /**
   * 初始化 Google Calendar API
   */
  async initialize(): Promise<boolean> {
    try {
      // 載入 Google API 腳本
      if (!window.gapi) {
        await this.loadGoogleAPI()
      }

      this.gapi = window.gapi

      // 初始化 API
      await new Promise((resolve, reject) => {
        this.gapi.load('client:auth2', () => {
          this.gapi.client.init({
            apiKey: this.config.apiKey,
            clientId: this.config.clientId,
            discoveryDocs: [this.config.discoveryDoc],
            scope: this.config.scope.join(' ')
          }).then(resolve).catch(reject)
        })
      })

      this.isInitialized = true
      this.isSignedIn = this.gapi.auth2.getAuthInstance().isSignedIn.get()

      // 監聽登入狀態變化
      this.gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn: boolean) => {
        this.isSignedIn = isSignedIn
        if (isSignedIn && this.syncSettings.autoSync) {
          this.startAutoSync()
        } else {
          this.stopAutoSync()
        }
      })

      return true
    } catch (error) {
      console.error('Failed to initialize Google Calendar API:', error)
      return false
    }
  }

  /**
   * 載入 Google API 腳本
   */
  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google API'))
      document.head.appendChild(script)
    })
  }

  /**
   * 登入 Google 帳戶
   */
  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Google Calendar API not initialized')
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      const user = await authInstance.signIn()
      this.isSignedIn = true
      return true
    } catch (error) {
      console.error('Google Calendar sign-in failed:', error)
      return false
    }
  }

  /**
   * 登出 Google 帳戶
   */
  async signOut(): Promise<void> {
    if (!this.isInitialized) {
      return
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
      this.isSignedIn = false
      this.stopAutoSync()
    } catch (error) {
      console.error('Google Calendar sign-out failed:', error)
    }
  }

  /**
   * 檢查是否已登入
   */
  isAuthenticated(): boolean {
    return this.isSignedIn
  }

  /**
   * 取得用戶資訊
   */
  getUserInfo(): any {
    if (!this.isSignedIn) {
      return null
    }

    const authInstance = this.gapi.auth2.getAuthInstance()
    const user = authInstance.currentUser.get()
    const profile = user.getBasicProfile()

    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl()
    }
  }

  /**
   * 取得行事曆列表
   */
  async getCalendarList(): Promise<GoogleCalendar[]> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google')
    }

    try {
      const response = await this.gapi.client.calendar.calendarList.list()
      return response.result.items || []
    } catch (error) {
      console.error('Failed to get calendar list:', error)
      throw error
    }
  }

  /**
   * 取得行事曆事件
   */
  async getEvents(
    calendarId: string = 'primary',
    options: {
      timeMin?: string
      timeMax?: string
      maxResults?: number
      orderBy?: 'startTime' | 'updated'
      showDeleted?: boolean
      singleEvents?: boolean
    } = {}
  ): Promise<GoogleCalendarEvent[]> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google')
    }

    try {
      const defaultOptions = {
        timeMin: new Date().toISOString(),
        maxResults: 250,
        singleEvents: true,
        orderBy: 'startTime'
      }

      const requestOptions = { ...defaultOptions, ...options }
      const response = await this.gapi.client.calendar.events.list({
        calendarId,
        ...requestOptions
      })

      return response.result.items || []
    } catch (error) {
      console.error('Failed to get events:', error)
      throw error
    }
  }

  /**
   * 建立事件
   */
  async createEvent(
    event: GoogleCalendarEvent,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google')
    }

    try {
      const response = await this.gapi.client.calendar.events.insert({
        calendarId,
        resource: event
      })

      return response.result
    } catch (error) {
      console.error('Failed to create event:', error)
      throw error
    }
  }

  /**
   * 更新事件
   */
  async updateEvent(
    eventId: string,
    event: GoogleCalendarEvent,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google')
    }

    try {
      const response = await this.gapi.client.calendar.events.update({
        calendarId,
        eventId,
        resource: event
      })

      return response.result
    } catch (error) {
      console.error('Failed to update event:', error)
      throw error
    }
  }

  /**
   * 刪除事件
   */
  async deleteEvent(
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<boolean> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google')
    }

    try {
      await this.gapi.client.calendar.events.delete({
        calendarId,
        eventId
      })

      return true
    } catch (error) {
      console.error('Failed to delete event:', error)
      throw error
    }
  }

  /**
   * 同步事件到 Google Calendar
   */
  async syncToGoogle(localEvents: any[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      imported: 0,
      exported: 0,
      updated: 0,
      deleted: 0,
      conflicts: [],
      errors: [],
      lastSyncTime: new Date()
    }

    try {
      for (const localEvent of localEvents) {
        try {
          const googleEvent = this.convertToGoogleEvent(localEvent)
          
          if (localEvent.googleEventId) {
            // 更新現有事件
            await this.updateEvent(localEvent.googleEventId, googleEvent)
            result.updated++
          } else {
            // 建立新事件
            const created = await this.createEvent(googleEvent)
            // 這裡需要更新本地事件的 googleEventId
            result.exported++
          }
        } catch (error) {
          result.errors.push({
            event: localEvent,
            error: error.message
          })
          result.success = false
        }
      }

      this.syncSettings.lastSyncTime = result.lastSyncTime
      this.saveSyncSettings()

    } catch (error) {
      console.error('Sync to Google failed:', error)
      result.success = false
    }

    return result
  }

  /**
   * 從 Google Calendar 同步事件
   */
  async syncFromGoogle(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      imported: 0,
      exported: 0,
      updated: 0,
      deleted: 0,
      conflicts: [],
      errors: [],
      lastSyncTime: new Date()
    }

    try {
      const calendars = this.syncSettings.selectedCalendars.length > 0
        ? this.syncSettings.selectedCalendars
        : ['primary']

      for (const calendarId of calendars) {
        try {
          const events = await this.getEvents(calendarId, {
            timeMin: this.getLastSyncTime(),
            showDeleted: true
          })

          for (const googleEvent of events) {
            const localEvent = this.convertFromGoogleEvent(googleEvent)
            // 這裡需要與本地事件服務整合
            // 檢查衝突、更新或建立本地事件
            result.imported++
          }
        } catch (error) {
          result.errors.push({
            event: { calendarId },
            error: error.message
          })
        }
      }

      this.syncSettings.lastSyncTime = result.lastSyncTime
      this.saveSyncSettings()

    } catch (error) {
      console.error('Sync from Google failed:', error)
      result.success = false
    }

    return result
  }

  /**
   * 雙向同步
   */
  async bidirectionalSync(localEvents: any[]): Promise<SyncResult> {
    const fromGoogleResult = await this.syncFromGoogle()
    const toGoogleResult = await this.syncToGoogle(localEvents)

    return {
      success: fromGoogleResult.success && toGoogleResult.success,
      imported: fromGoogleResult.imported,
      exported: toGoogleResult.exported,
      updated: fromGoogleResult.updated + toGoogleResult.updated,
      deleted: fromGoogleResult.deleted + toGoogleResult.deleted,
      conflicts: [...fromGoogleResult.conflicts, ...toGoogleResult.conflicts],
      errors: [...fromGoogleResult.errors, ...toGoogleResult.errors],
      lastSyncTime: new Date()
    }
  }

  /**
   * 取得上次同步時間
   */
  private getLastSyncTime(): string {
    const lastSync = this.syncSettings.lastSyncTime
    return lastSync ? lastSync.toISOString() : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }

  /**
   * 轉換為 Google Calendar 事件格式
   */
  private convertToGoogleEvent(localEvent: any): GoogleCalendarEvent {
    return {
      summary: localEvent.title || localEvent.summary,
      description: localEvent.description,
      start: {
        dateTime: localEvent.startTime || localEvent.start?.dateTime,
        timeZone: localEvent.timeZone || 'Asia/Taipei'
      },
      end: {
        dateTime: localEvent.endTime || localEvent.end?.dateTime,
        timeZone: localEvent.timeZone || 'Asia/Taipei'
      },
      location: localEvent.location,
      reminders: {
        useDefault: false,
        overrides: this.syncSettings.defaultReminders
      },
      colorId: localEvent.colorId,
      status: localEvent.status || 'confirmed'
    }
  }

  /**
   * 從 Google Calendar 事件格式轉換
   */
  private convertFromGoogleEvent(googleEvent: GoogleCalendarEvent): any {
    return {
      googleEventId: googleEvent.id,
      title: googleEvent.summary,
      description: googleEvent.description,
      startTime: googleEvent.start.dateTime || googleEvent.start.date,
      endTime: googleEvent.end.dateTime || googleEvent.end.date,
      location: googleEvent.location,
      isAllDay: !!googleEvent.start.date,
      colorId: googleEvent.colorId,
      status: googleEvent.status,
      created: googleEvent.created,
      updated: googleEvent.updated,
      creator: googleEvent.creator
    }
  }

  /**
   * 更新同步設定
   */
  updateSyncSettings(settings: Partial<CalendarSyncSettings>): void {
    this.syncSettings = { ...this.syncSettings, ...settings }
    this.saveSyncSettings()

    // 重新啟動自動同步
    if (this.syncSettings.autoSync && this.isSignedIn) {
      this.startAutoSync()
    } else {
      this.stopAutoSync()
    }
  }

  /**
   * 取得同步設定
   */
  getSyncSettings(): CalendarSyncSettings {
    return { ...this.syncSettings }
  }

  /**
   * 開始自動同步
   */
  private startAutoSync(): void {
    this.stopAutoSync()

    if (this.syncSettings.syncInterval > 0) {
      this.syncTimer = setInterval(async () => {
        try {
          console.log('Auto sync started...')
          // 這裡需要與本地行事曆服務整合
          // const localEvents = await calendarService.getAllEvents()
          // await this.bidirectionalSync(localEvents)
        } catch (error) {
          console.error('Auto sync failed:', error)
        }
      }, this.syncSettings.syncInterval * 60 * 1000)
    }
  }

  /**
   * 停止自動同步
   */
  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  /**
   * 手動觸發同步
   */
  async manualSync(localEvents: any[]): Promise<SyncResult> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google')
    }

    switch (this.syncSettings.syncDirection) {
      case 'import':
        return await this.syncFromGoogle()
      case 'export':
        return await this.syncToGoogle(localEvents)
      case 'bidirectional':
      default:
        return await this.bidirectionalSync(localEvents)
    }
  }

  /**
   * 解決同步衝突
   */
  async resolveConflicts(
    conflicts: Array<{
      localEvent: any
      googleEvent: GoogleCalendarEvent
      resolution: 'keep-local' | 'keep-google' | 'merge'
    }>
  ): Promise<void> {
    for (const conflict of conflicts) {
      try {
        switch (conflict.resolution) {
          case 'keep-local':
            await this.updateEvent(
              conflict.googleEvent.id!,
              this.convertToGoogleEvent(conflict.localEvent)
            )
            break
          case 'keep-google':
            // 更新本地事件
            break
          case 'merge':
            // 合併邏輯
            break
        }
      } catch (error) {
        console.error('Failed to resolve conflict:', error)
      }
    }
  }

  /**
   * 取得同步統計
   */
  getSyncStats(): {
    lastSyncTime?: Date
    totalSynced: number
    totalConflicts: number
    nextSyncTime?: Date
  } {
    return {
      lastSyncTime: this.syncSettings.lastSyncTime,
      totalSynced: 0, // 需要從儲存中取得
      totalConflicts: 0, // 需要從儲存中取得
      nextSyncTime: this.syncTimer && this.syncSettings.autoSync
        ? new Date(Date.now() + this.syncSettings.syncInterval * 60 * 1000)
        : undefined
    }
  }

  /**
   * 清理資源
   */
  destroy(): void {
    this.stopAutoSync()
  }
}

// 全域配置
const googleCalendarConfig: GoogleCalendarConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  scope: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ],
  discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
}

// 單例服務
export const googleCalendarService = new GoogleCalendarService(googleCalendarConfig)

// 便利函數
export function useGoogleCalendar() {
  return googleCalendarService
}