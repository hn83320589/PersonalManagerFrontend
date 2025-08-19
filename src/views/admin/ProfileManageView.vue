<template>
  <AdminLayout>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Form -->
        <div class="lg:col-span-2">
          <BaseCard title="基本資料">
            <BaseForm @submit="handleSaveProfile">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInput
                  v-model="profileForm.firstName"
                  label="名字 *"
                  placeholder="請輸入名字"
                  required
                />
                <BaseInput
                  v-model="profileForm.lastName"
                  label="姓氏 *"
                  placeholder="請輸入姓氏"
                  required
                />
              </div>

              <BaseInput
                v-model="profileForm.title"
                label="職稱 *"
                placeholder="例如：前端工程師、全端開發者"
                required
              />

              <BaseTextarea
                v-model="profileForm.bio"
                label="個人簡介 *"
                placeholder="簡短介紹您的專業背景和技能..."
                :rows="4"
                required
              />

              <BaseTextarea
                v-model="profileForm.description"
                label="詳細描述"
                placeholder="更詳細的個人介紹，包含工作經驗、專業技能等..."
                :rows="6"
              />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInput
                  v-model="profileForm.email"
                  type="email"
                  label="聯絡信箱 *"
                  placeholder="your.email@example.com"
                  required
                />
                <BaseInput
                  v-model="profileForm.phone"
                  type="tel"
                  label="聯絡電話"
                  placeholder="+886 912 345 678"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInput
                  v-model="profileForm.location"
                  label="所在地點"
                  placeholder="例如：台北市, 台灣"
                />
                <BaseInput
                  v-model="profileForm.website"
                  type="url"
                  label="個人網站"
                  placeholder="https://your-website.com"
                />
              </div>

              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900">社群媒體</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BaseInput
                    v-model="profileForm.linkedin"
                    label="LinkedIn"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  <BaseInput
                    v-model="profileForm.github"
                    label="GitHub"
                    placeholder="https://github.com/yourusername"
                  />
                  <BaseInput
                    v-model="profileForm.twitter"
                    label="Twitter"
                    placeholder="https://twitter.com/yourusername"
                  />
                  <BaseInput
                    v-model="profileForm.instagram"
                    label="Instagram"
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>
              </div>

              <!-- Visibility Settings -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900">顯示設定</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">公開顯示個人資料</label>
                      <p class="text-sm text-gray-500">允許訪客查看您的基本資訊</p>
                    </div>
                    <input
                      v-model="profileForm.isPublic"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">顯示聯絡資訊</label>
                      <p class="text-sm text-gray-500">在公開頁面顯示聯絡方式</p>
                    </div>
                    <input
                      v-model="profileForm.showContact"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">顯示社群連結</label>
                      <p class="text-sm text-gray-500">在公開頁面顯示社群媒體連結</p>
                    </div>
                    <input
                      v-model="profileForm.showSocial"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              <div class="flex justify-end space-x-4 pt-6">
                <BaseButton variant="outline" @click="resetForm">
                  重置
                </BaseButton>
                <BaseButton 
                  type="submit" 
                  :loading="isSaving"
                  :disabled="!isFormValid"
                >
                  儲存變更
                </BaseButton>
              </div>
            </BaseForm>
          </BaseCard>
        </div>

        <!-- Profile Preview -->
        <div class="lg:col-span-1">
          <BaseCard title="預覽">
            <div class="space-y-6">
              <!-- Avatar Section -->
              <div class="text-center">
                <div class="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-semibold">
                  {{ getInitials(profileForm.firstName, profileForm.lastName) }}
                </div>
                <div class="mt-4">
                  <BaseButton variant="outline" size="small">
                    上傳頭像
                  </BaseButton>
                </div>
              </div>

              <!-- Preview Content -->
              <div class="space-y-4">
                <div class="text-center">
                  <h3 class="text-xl font-semibold text-gray-900">
                    {{ profileForm.firstName }} {{ profileForm.lastName }}
                  </h3>
                  <p class="text-gray-600">{{ profileForm.title }}</p>
                  <p v-if="profileForm.location" class="text-sm text-gray-500 flex items-center justify-center mt-1">
                    <MapPinIcon class="w-4 h-4 mr-1" />
                    {{ profileForm.location }}
                  </p>
                </div>

                <div v-if="profileForm.bio">
                  <h4 class="font-medium text-gray-900">簡介</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ profileForm.bio }}</p>
                </div>

                <div v-if="profileForm.showContact && (profileForm.email || profileForm.phone)">
                  <h4 class="font-medium text-gray-900">聯絡方式</h4>
                  <div class="space-y-1 mt-1">
                    <p v-if="profileForm.email" class="text-sm text-gray-600 flex items-center">
                      <EnvelopeIcon class="w-4 h-4 mr-2" />
                      {{ profileForm.email }}
                    </p>
                    <p v-if="profileForm.phone" class="text-sm text-gray-600 flex items-center">
                      <PhoneIcon class="w-4 h-4 mr-2" />
                      {{ profileForm.phone }}
                    </p>
                  </div>
                </div>

                <div v-if="profileForm.showSocial && hasSocialLinks">
                  <h4 class="font-medium text-gray-900">社群連結</h4>
                  <div class="flex space-x-2 mt-2">
                    <a v-if="profileForm.linkedin" href="#" class="text-blue-600 hover:text-blue-800">
                      <BriefcaseIcon class="w-5 h-5" />
                    </a>
                    <a v-if="profileForm.github" href="#" class="text-gray-700 hover:text-gray-900">
                      <CodeBracketIcon class="w-5 h-5" />
                    </a>
                    <a v-if="profileForm.twitter" href="#" class="text-blue-400 hover:text-blue-600">
                      <ChatBubbleLeftEllipsisIcon class="w-5 h-5" />
                    </a>
                    <a v-if="profileForm.website" href="#" class="text-primary-600 hover:text-primary-800">
                      <GlobeAltIcon class="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              <!-- Visibility Status -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-sm font-medium text-gray-900 mb-2">顯示狀態</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-between">
                    <span>公開顯示</span>
                    <span :class="profileForm.isPublic ? 'text-green-600' : 'text-gray-400'">
                      {{ profileForm.isPublic ? '✓ 啟用' : '✗ 停用' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>聯絡資訊</span>
                    <span :class="profileForm.showContact ? 'text-green-600' : 'text-gray-400'">
                      {{ profileForm.showContact ? '✓ 顯示' : '✗ 隱藏' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>社群連結</span>
                    <span :class="profileForm.showSocial ? 'text-green-600' : 'text-gray-400'">
                      {{ profileForm.showSocial ? '✓ 顯示' : '✗ 隱藏' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  ChatBubbleLeftEllipsisIcon,
  GlobeAltIcon
} from '@heroicons/vue/24/outline'
import { useProfileStore } from '@/stores/profile'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseForm from '@/components/ui/BaseForm.vue'

// Router
const router = useRouter()

// Stores
const profileStore = useProfileStore()

// State
const isSaving = ref(false)

const profileForm = reactive({
  firstName: '',
  lastName: '',
  title: '',
  bio: '',
  description: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  github: '',
  twitter: '',
  instagram: '',
  isPublic: true,
  showContact: true,
  showSocial: true
})

// Computed
const isFormValid = computed(() => {
  return profileForm.firstName.trim() && 
         profileForm.lastName.trim() && 
         profileForm.title.trim() && 
         profileForm.bio.trim() &&
         profileForm.email.trim()
})

const hasSocialLinks = computed(() => {
  return profileForm.linkedin || profileForm.github || profileForm.twitter || profileForm.instagram || profileForm.website
})

// Methods
function getInitials(firstName: string, lastName: string): string {
  const first = firstName.charAt(0).toUpperCase()
  const last = lastName.charAt(0).toUpperCase()
  return first + last || 'U'
}

async function handleSaveProfile() {
  if (!isFormValid.value || isSaving.value) return

  isSaving.value = true

  try {
    // In a real app, this would call the API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Profile saved:', profileForm)
    
    // Show success message (in a real app, you'd use a toast notification)
    alert('個人資料已儲存！')
    
  } catch (error) {
    console.error('Save profile error:', error)
    alert('儲存失敗，請稍後再試。')
  } finally {
    isSaving.value = false
  }
}

function resetForm() {
  // Reset to default/original values
  Object.assign(profileForm, {
    firstName: 'John',
    lastName: 'Doe',
    title: '全端開發工程師',
    bio: '熱愛程式開發，專精於前端與後端技術，擁有豐富的專案開發經驗。',
    description: '',
    email: 'john.doe@example.com',
    phone: '+886 912 345 678',
    location: '台北市, 台灣',
    website: 'https://johndoe.dev',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    instagram: '',
    isPublic: true,
    showContact: true,
    showSocial: true
  })
}

// Lifecycle
onMounted(async () => {
  try {
    // In a real app, this would fetch the current profile data
    // For now, we'll use a demo user ID
    await profileStore.fetchCurrentUserProfile(1)
    
    // For demo purposes, set some default data
    resetForm()
    
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
})
</script>

<style scoped>
/* Custom styles if needed */
</style>