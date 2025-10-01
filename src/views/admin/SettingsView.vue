<template>
  <AdminLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">系統設定</h2>
          <p class="mt-1 text-sm text-gray-600">
            管理系統配置、使用者偏好和安全設定
          </p>
        </div>
        <div class="flex space-x-3">
          <BaseButton
            variant="outline"
            @click="exportSettings"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            匯出設定
          </BaseButton>
          <BaseButton
            variant="outline"
            @click="showImportModal = true"
          >
            <ArrowUpTrayIcon class="w-4 h-4 mr-2" />
            匯入設定
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="saveAllSettings"
            :disabled="!hasUnsavedChanges"
          >
            <CheckIcon class="w-4 h-4 mr-2" />
            儲存所有設定
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Settings Navigation -->
    <div class="mb-6">
      <nav class="flex space-x-8">
        <button
          v-for="tab in settingTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <component :is="tab.icon" class="w-5 h-5 inline mr-2" />
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Settings Content -->
    <div class="bg-white shadow rounded-lg">
      <!-- General Settings -->
      <div v-if="activeTab === 'general'" class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-6">一般設定</h3>
        
        <div class="space-y-6">
          <!-- Site Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">網站名稱</label>
              <BaseInput
                v-model="settings.general.siteName"
                placeholder="Personal Manager"
                @input="markAsChanged('general')"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">網站標語</label>
              <BaseInput
                v-model="settings.general.siteTagline"
                placeholder="個人管理系統"
                @input="markAsChanged('general')"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">管理員郵箱</label>
              <BaseInput
                v-model="settings.general.adminEmail"
                type="email"
                placeholder="admin@example.com"
                @input="markAsChanged('general')"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">時區</label>
              <BaseSelect
                v-model="settings.general.timezone"
                :options="timezoneOptions"
                @change="markAsChanged('general')"
              />
            </div>
          </div>

          <!-- Language & Locale -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">語言與地區設定</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">預設語言</label>
                <BaseSelect
                  v-model="settings.general.defaultLanguage"
                  :options="languageOptions"
                  @change="markAsChanged('general')"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">日期格式</label>
                <BaseSelect
                  v-model="settings.general.dateFormat"
                  :options="dateFormatOptions"
                  @change="markAsChanged('general')"
                />
              </div>
            </div>
          </div>

          <!-- Performance -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">性能設定</h4>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">啟用快取</label>
                  <p class="text-xs text-gray-500">提升系統載入速度</p>
                </div>
                <input
                  v-model="settings.general.enableCache"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('general')"
                />
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">懶載入</label>
                  <p class="text-xs text-gray-500">圖片和內容按需載入</p>
                </div>
                <input
                  v-model="settings.general.lazyLoading"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('general')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div v-if="activeTab === 'security'" class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-6">安全設定</h3>
        
        <div class="space-y-6">
          <!-- Authentication -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-4">身份驗證</h4>
            
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    密碼最小長度
                  </label>
                  <BaseInput
                    v-model.number="settings.security.minPasswordLength"
                    type="number"
                    min="6"
                    max="32"
                    @input="markAsChanged('security')"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    JWT Token 過期時間 (分鐘)
                  </label>
                  <BaseInput
                    v-model.number="settings.security.jwtExpiration"
                    type="number"
                    min="15"
                    max="1440"
                    @input="markAsChanged('security')"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">要求強密碼</label>
                  <p class="text-xs text-gray-500">密碼必須包含大小寫字母、數字和特殊符號</p>
                </div>
                <input
                  v-model="settings.security.requireStrongPassword"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('security')"
                />
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">啟用兩步驗證</label>
                  <p class="text-xs text-gray-500">使用郵件或SMS進行二次驗證</p>
                </div>
                <input
                  v-model="settings.security.enable2FA"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('security')"
                />
              </div>
            </div>
          </div>

          <!-- Rate Limiting -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">限流設定</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  登入嘗試限制 (次/小時)
                </label>
                <BaseInput
                  v-model.number="settings.security.loginAttempts"
                  type="number"
                  min="3"
                  max="20"
                  @input="markAsChanged('security')"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  API 請求限制 (次/分鐘)
                </label>
                <BaseInput
                  v-model.number="settings.security.apiRateLimit"
                  type="number"
                  min="10"
                  max="1000"
                  @input="markAsChanged('security')"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  封鎖時間 (分鐘)
                </label>
                <BaseInput
                  v-model.number="settings.security.blockDuration"
                  type="number"
                  min="5"
                  max="1440"
                  @input="markAsChanged('security')"
                />
              </div>
            </div>
          </div>

          <!-- Privacy -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">隱私設定</h4>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">記錄使用者活動</label>
                  <p class="text-xs text-gray-500">記錄登入、操作等活動日誌</p>
                </div>
                <input
                  v-model="settings.security.logUserActivity"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('security')"
                />
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">匿名化IP地址</label>
                  <p class="text-xs text-gray-500">儲存時隱藏完整IP地址</p>
                </div>
                <input
                  v-model="settings.security.anonymizeIp"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('security')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Settings -->
      <div v-if="activeTab === 'notifications'" class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-6">通知設定</h3>
        
        <div class="space-y-6">
          <!-- Email Notifications -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-4">郵件通知</h4>
            
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SMTP 伺服器</label>
                  <BaseInput
                    v-model="settings.notifications.smtpServer"
                    placeholder="smtp.gmail.com"
                    @input="markAsChanged('notifications')"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SMTP 埠口</label>
                  <BaseInput
                    v-model.number="settings.notifications.smtpPort"
                    type="number"
                    placeholder="587"
                    @input="markAsChanged('notifications')"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">發件人郵箱</label>
                  <BaseInput
                    v-model="settings.notifications.fromEmail"
                    type="email"
                    placeholder="noreply@example.com"
                    @input="markAsChanged('notifications')"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">發件人名稱</label>
                  <BaseInput
                    v-model="settings.notifications.fromName"
                    placeholder="Personal Manager"
                    @input="markAsChanged('notifications')"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">使用SSL/TLS</label>
                  <p class="text-xs text-gray-500">啟用加密連線</p>
                </div>
                <input
                  v-model="settings.notifications.useSSL"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('notifications')"
                />
              </div>
            </div>
          </div>

          <!-- Notification Types -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">通知類型</h4>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">新留言通知</label>
                  <p class="text-xs text-gray-500">有新訪客留言時發送郵件</p>
                </div>
                <input
                  v-model="settings.notifications.newComment"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('notifications')"
                />
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">系統錯誤通知</label>
                  <p class="text-xs text-gray-500">系統發生錯誤時發送警報</p>
                </div>
                <input
                  v-model="settings.notifications.systemError"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('notifications')"
                />
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">定期報告</label>
                  <p class="text-xs text-gray-500">每週發送系統使用報告</p>
                </div>
                <input
                  v-model="settings.notifications.weeklyReport"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('notifications')"
                />
              </div>
            </div>
          </div>

          <!-- Push Notifications -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">推播通知</h4>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">瀏覽器通知</label>
                  <p class="text-xs text-gray-500">使用瀏覽器原生通知功能</p>
                </div>
                <input
                  v-model="settings.notifications.browserNotifications"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('notifications')"
                />
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Firebase Server Key</label>
                  <BaseInput
                    v-model="settings.notifications.firebaseServerKey"
                    type="password"
                    placeholder="請輸入Firebase Server Key"
                    @input="markAsChanged('notifications')"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Firebase Sender ID</label>
                  <BaseInput
                    v-model="settings.notifications.firebaseSenderId"
                    placeholder="請輸入Firebase Sender ID"
                    @input="markAsChanged('notifications')"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Appearance Settings -->
      <div v-if="activeTab === 'appearance'" class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-6">外觀設定</h3>
        
        <div class="space-y-6">
          <!-- Theme Settings -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-4">主題設定</h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">預設主題</label>
                <BaseSelect
                  v-model="settings.appearance.defaultTheme"
                  :options="themeOptions"
                  @change="markAsChanged('appearance')"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">主色調</label>
                <div class="flex space-x-3">
                  <button
                    v-for="color in primaryColors"
                    :key="color.name"
                    @click="settings.appearance.primaryColor = color.value; markAsChanged('appearance')"
                    :class="[
                      'w-8 h-8 rounded-full border-2 transition-all',
                      settings.appearance.primaryColor === color.value
                        ? 'border-gray-400 ring-2 ring-gray-300'
                        : 'border-gray-200'
                    ]"
                    :style="{ backgroundColor: color.value }"
                    :title="color.name"
                  ></button>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">允許用戶切換主題</label>
                  <p class="text-xs text-gray-500">用戶可以在深色和淺色主題間切換</p>
                </div>
                <input
                  v-model="settings.appearance.allowThemeSwitch"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('appearance')"
                />
              </div>
            </div>
          </div>

          <!-- Layout Settings -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">版面設定</h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">版面寬度</label>
                <BaseSelect
                  v-model="settings.appearance.layoutWidth"
                  :options="layoutWidthOptions"
                  @change="markAsChanged('appearance')"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">側邊欄位置</label>
                <BaseSelect
                  v-model="settings.appearance.sidebarPosition"
                  :options="sidebarPositionOptions"
                  @change="markAsChanged('appearance')"
                />
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">固定標題列</label>
                  <p class="text-xs text-gray-500">標題列始終顯示在頂部</p>
                </div>
                <input
                  v-model="settings.appearance.fixedHeader"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="markAsChanged('appearance')"
                />
              </div>
            </div>
          </div>

          <!-- Typography -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">文字設定</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">字體系列</label>
                <BaseSelect
                  v-model="settings.appearance.fontFamily"
                  :options="fontFamilyOptions"
                  @change="markAsChanged('appearance')"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">基礎字體大小</label>
                <BaseSelect
                  v-model="settings.appearance.fontSize"
                  :options="fontSizeOptions"
                  @change="markAsChanged('appearance')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Settings -->
      <div v-if="activeTab === 'system'" class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-6">系統維護</h3>
        
        <div class="space-y-6">
          <!-- Database -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-4">資料庫管理</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseButton
                variant="outline"
                @click="backupDatabase"
                :loading="isBackingUp"
              >
                <CircleStackIcon class="w-4 h-4 mr-2" />
                備份資料庫
              </BaseButton>
              
              <BaseButton
                variant="outline"
                @click="optimizeDatabase"
                :loading="isOptimizing"
              >
                <ArrowPathIcon class="w-4 h-4 mr-2" />
                優化資料庫
              </BaseButton>
              
              <BaseButton
                variant="outline"
                @click="showClearDataModal = true"
                class="text-red-600"
              >
                <TrashIcon class="w-4 h-4 mr-2" />
                清理數據
              </BaseButton>
            </div>
          </div>

          <!-- Cache Management -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">快取管理</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseButton
                variant="outline"
                @click="clearCache('all')"
              >
                <TrashIcon class="w-4 h-4 mr-2" />
                清除所有快取
              </BaseButton>
              
              <BaseButton
                variant="outline"
                @click="clearCache('images')"
              >
                <PhotoIcon class="w-4 h-4 mr-2" />
                清除圖片快取
              </BaseButton>
              
              <BaseButton
                variant="outline"
                @click="clearCache('api')"
              >
                <GlobeAltIcon class="w-4 h-4 mr-2" />
                清除API快取
              </BaseButton>
            </div>
          </div>

          <!-- System Information -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">系統資訊</h4>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">系統版本</dt>
                  <dd class="text-sm text-gray-900">{{ systemInfo.version }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">運行時間</dt>
                  <dd class="text-sm text-gray-900">{{ systemInfo.uptime }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">資料庫版本</dt>
                  <dd class="text-sm text-gray-900">{{ systemInfo.dbVersion }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">最後備份</dt>
                  <dd class="text-sm text-gray-900">{{ systemInfo.lastBackup || '從未備份' }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Settings Modal -->
    <BaseModal
      :show="showImportModal"
      @close="showImportModal = false"
      title="匯入設定"
      max-width="md"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          選擇要匯入的設定檔案（JSON格式）
        </p>
        
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleImportFile"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        
        <div class="flex items-center">
          <input
            v-model="importSettings.overwrite"
            type="checkbox"
            id="overwrite"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
          />
          <label for="overwrite" class="text-sm text-gray-700">
            覆蓋現有設定
          </label>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <BaseButton
          variant="outline"
          @click="showImportModal = false"
        >
          取消
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="importSettingsFile"
          :disabled="!importSettings.file"
        >
          匯入
        </BaseButton>
      </div>
    </BaseModal>

    <!-- Clear Data Modal -->
    <BaseModal
      :show="showClearDataModal"
      @close="showClearDataModal = false"
      title="清理數據"
      max-width="md"
    >
      <div class="space-y-4">
        <p class="text-sm text-red-600 font-medium">
          ⚠️ 警告：此操作將永久刪除選中的數據，無法復原！
        </p>
        
        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="clearDataOptions.logs"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            清理系統日誌 (30天以前)
          </label>
          
          <label class="flex items-center">
            <input
              v-model="clearDataOptions.cache"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            清理快取文件
          </label>
          
          <label class="flex items-center">
            <input
              v-model="clearDataOptions.tempFiles"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            清理暫存文件
          </label>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <BaseButton
          variant="outline"
          @click="showClearDataModal = false"
        >
          取消
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="clearSelectedData"
          class="bg-red-600 hover:bg-red-700"
        >
          確認清理
        </BaseButton>
      </div>
    </BaseModal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  PaintBrushIcon,
  ServerIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  CircleStackIcon,
  ArrowPathIcon,
  TrashIcon,
  PhotoIcon,
  GlobeAltIcon
} from '@heroicons/vue/24/outline'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

// State
const activeTab = ref('general')
const hasUnsavedChanges = ref(false)
const changedSections = ref<Set<string>>(new Set())
const showImportModal = ref(false)
const showClearDataModal = ref(false)
const isBackingUp = ref(false)
const isOptimizing = ref(false)
const fileInput = ref<HTMLInputElement>()

const importSettings = ref({
  file: null as File | null,
  overwrite: false
})

const clearDataOptions = ref({
  logs: true,
  cache: true,
  tempFiles: true
})

// Settings Data
const settings = ref({
  general: {
    siteName: 'Personal Manager',
    siteTagline: '個人管理系統',
    adminEmail: 'admin@example.com',
    timezone: 'Asia/Taipei',
    defaultLanguage: 'zh-TW',
    dateFormat: 'YYYY-MM-DD',
    enableCache: true,
    lazyLoading: true
  },
  security: {
    minPasswordLength: 8,
    jwtExpiration: 120,
    requireStrongPassword: true,
    enable2FA: false,
    loginAttempts: 5,
    apiRateLimit: 60,
    blockDuration: 15,
    logUserActivity: true,
    anonymizeIp: false
  },
  notifications: {
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    fromEmail: 'noreply@example.com',
    fromName: 'Personal Manager',
    useSSL: true,
    newComment: true,
    systemError: true,
    weeklyReport: false,
    browserNotifications: true,
    firebaseServerKey: '',
    firebaseSenderId: ''
  },
  appearance: {
    defaultTheme: 'light',
    primaryColor: '#3B82F6',
    allowThemeSwitch: true,
    layoutWidth: 'container',
    sidebarPosition: 'left',
    fixedHeader: true,
    fontFamily: 'system',
    fontSize: 'medium'
  }
})

const systemInfo = ref({
  version: '1.0.0',
  uptime: '7 天 12 小時',
  dbVersion: 'MariaDB 10.6',
  lastBackup: '2024-01-15 14:30:00'
})

// Settings Configuration
const settingTabs = [
  { id: 'general', name: '一般設定', icon: Cog6ToothIcon },
  { id: 'security', name: '安全設定', icon: ShieldCheckIcon },
  { id: 'notifications', name: '通知設定', icon: BellIcon },
  { id: 'appearance', name: '外觀設定', icon: PaintBrushIcon },
  { id: 'system', name: '系統維護', icon: ServerIcon }
]

const timezoneOptions = [
  { value: 'Asia/Taipei', label: '台北 (GMT+8)' },
  { value: 'Asia/Shanghai', label: '上海 (GMT+8)' },
  { value: 'Asia/Tokyo', label: '東京 (GMT+9)' },
  { value: 'America/New_York', label: '紐約 (GMT-5)' },
  { value: 'Europe/London', label: '倫敦 (GMT+0)' }
]

const languageOptions = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
  { value: 'ja-JP', label: '日本語' }
]

const dateFormatOptions = [
  { value: 'YYYY-MM-DD', label: '2024-01-15' },
  { value: 'DD/MM/YYYY', label: '15/01/2024' },
  { value: 'MM/DD/YYYY', label: '01/15/2024' },
  { value: 'DD-MM-YYYY', label: '15-01-2024' }
]

const themeOptions = [
  { value: 'light', label: '淺色主題' },
  { value: 'dark', label: '深色主題' },
  { value: 'auto', label: '跟隨系統' }
]

const primaryColors = [
  { name: '藍色', value: '#3B82F6' },
  { name: '綠色', value: '#10B981' },
  { name: '紫色', value: '#8B5CF6' },
  { name: '紅色', value: '#EF4444' },
  { name: '橙色', value: '#F59E0B' },
  { name: '粉色', value: '#EC4899' }
]

const layoutWidthOptions = [
  { value: 'full', label: '全寬度' },
  { value: 'container', label: '容器寬度' },
  { value: 'narrow', label: '窄版面' }
]

const sidebarPositionOptions = [
  { value: 'left', label: '左側' },
  { value: 'right', label: '右側' }
]

const fontFamilyOptions = [
  { value: 'system', label: '系統字體' },
  { value: 'serif', label: '襯線字體' },
  { value: 'mono', label: '等寬字體' }
]

const fontSizeOptions = [
  { value: 'small', label: '小 (14px)' },
  { value: 'medium', label: '中 (16px)' },
  { value: 'large', label: '大 (18px)' }
]

// Methods
function markAsChanged(section: string) {
  changedSections.value.add(section)
  hasUnsavedChanges.value = true
}

function exportSettings() {
  const exportData = {
    settings: settings.value,
    exportDate: new Date().toISOString(),
    version: systemInfo.value.version
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleImportFile(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    importSettings.value.file = file
  }
}

async function importSettingsFile() {
  if (!importSettings.value.file) return
  
  try {
    const text = await importSettings.value.file.text()
    const importedData = JSON.parse(text)
    
    if (importedData.settings) {
      if (importSettings.value.overwrite) {
        settings.value = importedData.settings
      } else {
        // Merge settings instead of overwriting
        Object.keys(importedData.settings).forEach(section => {
          if (settings.value[section as keyof typeof settings.value]) {
            Object.assign(settings.value[section as keyof typeof settings.value], importedData.settings[section])
          }
        })
      }
      
      markAsChanged('all')
      showImportModal.value = false
      alert('設定匯入成功！')
    }
  } catch (error) {
    console.error('Import error:', error)
    alert('匯入失敗：檔案格式不正確')
  }
}

async function saveAllSettings() {
  try {
    // In a real app, save to backend
    console.log('Saving all settings:', settings.value)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    hasUnsavedChanges.value = false
    changedSections.value.clear()
    alert('所有設定已成功儲存！')
  } catch (error) {
    console.error('Save error:', error)
    alert('儲存失敗，請重試')
  }
}

async function backupDatabase() {
  isBackingUp.value = true
  try {
    // Simulate database backup
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    systemInfo.value.lastBackup = new Date().toLocaleString('zh-TW')
    alert('資料庫備份完成！')
  } catch (error) {
    console.error('Backup error:', error)
    alert('備份失敗，請重試')
  } finally {
    isBackingUp.value = false
  }
}

async function optimizeDatabase() {
  isOptimizing.value = true
  try {
    // Simulate database optimization
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('資料庫優化完成！')
  } catch (error) {
    console.error('Optimization error:', error)
    alert('優化失敗，請重試')
  } finally {
    isOptimizing.value = false
  }
}

async function clearCache(type: string) {
  try {
    // Simulate cache clearing
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const messages = {
      all: '所有快取已清除',
      images: '圖片快取已清除',
      api: 'API快取已清除'
    }
    
    alert(messages[type as keyof typeof messages] || '快取已清除')
  } catch (error) {
    console.error('Clear cache error:', error)
    alert('清除失敗，請重試')
  }
}

async function clearSelectedData() {
  try {
    const selectedOptions = Object.entries(clearDataOptions.value)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key)
    
    if (selectedOptions.length === 0) {
      alert('請選擇要清理的數據類型')
      return
    }
    
    // Simulate data clearing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    showClearDataModal.value = false
    alert(`已清理：${selectedOptions.join('、')}`)
  } catch (error) {
    console.error('Clear data error:', error)
    alert('清理失敗，請重試')
  }
}

// Lifecycle
onMounted(() => {
  // Load settings from backend in real app
  console.log('Loading system settings...')
})
</script>