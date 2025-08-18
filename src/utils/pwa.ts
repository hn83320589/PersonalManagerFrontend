// PWA utilities for service worker registration and updates
export class PWAManager {
  private registration: ServiceWorkerRegistration | null = null
  private updateAvailable = false

  async register(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('Service Worker registered:', this.registration)

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found')
        this.handleUpdate()
      })

      // Check for updates periodically
      setInterval(() => {
        this.registration?.update()
      }, 60000) // Check every minute

    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  private handleUpdate(): void {
    if (!this.registration?.installing) return

    const newWorker = this.registration.installing

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.updateAvailable = true
        this.notifyUpdateAvailable()
      }
    })
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for the app to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'))
    
    // You can also show a notification or update banner here
    console.log('App update available! Refresh to get the latest version.')
  }

  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) return

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable
  }

  async requestPersistentStorage(): Promise<boolean> {
    if (!('storage' in navigator) || !('persist' in navigator.storage)) {
      return false
    }

    try {
      const isPersistent = await navigator.storage.persist()
      console.log('Persistent storage:', isPersistent)
      return isPersistent
    } catch (error) {
      console.error('Failed to request persistent storage:', error)
      return false
    }
  }

  async getStorageEstimate(): Promise<StorageEstimate | null> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null
    }

    try {
      const estimate = await navigator.storage.estimate()
      console.log('Storage estimate:', estimate)
      return estimate
    } catch (error) {
      console.error('Failed to get storage estimate:', error)
      return null
    }
  }
}

// Install prompt management
export class InstallPromptManager {
  private deferredPrompt: any = null
  private isInstallable = false

  constructor() {
    this.setupInstallPrompt()
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault()
      
      // Save the event for later use
      this.deferredPrompt = event
      this.isInstallable = true
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('app-installable'))
      
      console.log('App is installable')
    })

    window.addEventListener('appinstalled', () => {
      console.log('App was installed')
      this.deferredPrompt = null
      this.isInstallable = false
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('app-installed'))
    })
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('Install prompt not available')
      return false
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt()
      
      // Wait for the user to respond
      const { outcome } = await this.deferredPrompt.userChoice
      
      console.log('Install prompt outcome:', outcome)
      
      // Clear the saved prompt
      this.deferredPrompt = null
      this.isInstallable = false
      
      return outcome === 'accepted'
    } catch (error) {
      console.error('Failed to show install prompt:', error)
      return false
    }
  }

  canInstall(): boolean {
    return this.isInstallable
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }
}

// Network status monitoring
export class NetworkMonitor {
  private online = navigator.onLine
  private callbacks: Array<(online: boolean) => void> = []

  constructor() {
    this.setupNetworkListeners()
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.online = true
      this.notifyCallbacks()
      console.log('Network: Online')
    })

    window.addEventListener('offline', () => {
      this.online = false
      this.notifyCallbacks()
      console.log('Network: Offline')
    })
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.online))
  }

  isOnline(): boolean {
    return this.online
  }

  onStatusChange(callback: (online: boolean) => void): void {
    this.callbacks.push(callback)
  }

  removeStatusListener(callback: (online: boolean) => void): void {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/ping', {
        method: 'HEAD',
        cache: 'no-cache',
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Background sync manager
export class BackgroundSyncManager {
  private registration: ServiceWorkerRegistration | null = null

  constructor(registration: ServiceWorkerRegistration | null) {
    this.registration = registration
  }

  async requestSync(tag: string): Promise<void> {
    if (!this.registration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background sync not supported')
      return
    }

    try {
      await (this.registration as any).sync.register(tag)
      console.log('Background sync registered:', tag)
    } catch (error) {
      console.error('Background sync registration failed:', error)
    }
  }

  async scheduleDataSync(): Promise<void> {
    await this.requestSync('background-sync')
  }
}

// Push notification manager
export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null

  constructor(registration: ServiceWorkerRegistration | null) {
    this.registration = registration
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    console.log('Notification permission:', permission)
    return permission
  }

  async subscribe(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.warn('Service Worker not registered')
      return null
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      })

      console.log('Push subscription:', subscription)
      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}