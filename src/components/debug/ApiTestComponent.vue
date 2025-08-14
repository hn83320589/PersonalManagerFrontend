<template>
  <div class="bg-white border rounded-lg p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">API 連接測試</h2>
    
    <div class="space-y-4">
      <!-- Test Users API -->
      <div class="border-l-4 border-blue-500 pl-4">
        <h3 class="text-lg font-medium">Users API</h3>
        <button 
          @click="testUsersAPI" 
          :disabled="loading.users"
          class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ loading.users ? '載入中...' : '測試 Users API' }}
        </button>
        <div v-if="results.users" class="mt-2">
          <p class="text-sm text-green-600">✓ 成功取得 {{ results.users.length }} 位使用者</p>
        </div>
        <div v-if="errors.users" class="mt-2">
          <p class="text-sm text-red-600">✗ 錯誤: {{ errors.users }}</p>
        </div>
      </div>

      <!-- Test Skills API -->
      <div class="border-l-4 border-green-500 pl-4">
        <h3 class="text-lg font-medium">Skills API</h3>
        <button 
          @click="testSkillsAPI" 
          :disabled="loading.skills"
          class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {{ loading.skills ? '載入中...' : '測試 Skills API' }}
        </button>
        <div v-if="results.skills" class="mt-2">
          <p class="text-sm text-green-600">✓ 成功取得 {{ results.skills.length }} 項技能</p>
        </div>
        <div v-if="errors.skills" class="mt-2">
          <p class="text-sm text-red-600">✗ 錯誤: {{ errors.skills }}</p>
        </div>
      </div>

      <!-- Test PersonalProfiles API -->
      <div class="border-l-4 border-purple-500 pl-4">
        <h3 class="text-lg font-medium">Personal Profiles API</h3>
        <button 
          @click="testProfilesAPI" 
          :disabled="loading.profiles"
          class="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {{ loading.profiles ? '載入中...' : '測試 Profiles API' }}
        </button>
        <div v-if="results.profiles" class="mt-2">
          <p class="text-sm text-green-600">✓ 成功取得 {{ results.profiles.length }} 筆個人資料</p>
        </div>
        <div v-if="errors.profiles" class="mt-2">
          <p class="text-sm text-red-600">✗ 錯誤: {{ errors.profiles }}</p>
        </div>
      </div>

      <!-- Demo Login Test -->
      <div class="border-l-4 border-yellow-500 pl-4">
        <h3 class="text-lg font-medium">Demo 登入測試</h3>
        <button 
          @click="testDemoLogin" 
          :disabled="loading.demoLogin"
          class="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          {{ loading.demoLogin ? '載入中...' : '測試 Demo 登入' }}
        </button>
        <div v-if="results.demoLogin" class="mt-2">
          <p class="text-sm text-green-600">✓ Demo 登入成功：{{ results.demoLogin.user.username }}</p>
        </div>
        <div v-if="errors.demoLogin" class="mt-2">
          <p class="text-sm text-red-600">✗ 錯誤: {{ errors.demoLogin }}</p>
        </div>
      </div>
    </div>

    <!-- 測試全部 -->
    <div class="mt-6 pt-4 border-t">
      <button 
        @click="testAllAPIs" 
        :disabled="isAnyLoading"
        class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {{ isAnyLoading ? '測試中...' : '測試全部 API' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import httpService from '@/services/http'
import authService from '@/services/authService'
import type { User, Skill, PersonalProfile } from '@/types/api'

const loading = reactive({
  users: false,
  skills: false,
  profiles: false,
  demoLogin: false
})

const results = reactive({
  users: null as User[] | null,
  skills: null as Skill[] | null,
  profiles: null as PersonalProfile[] | null,
  demoLogin: null as any | null
})

const errors = reactive({
  users: '',
  skills: '',
  profiles: '',
  demoLogin: ''
})

const isAnyLoading = computed(() => {
  return Object.values(loading).some(v => v)
})

const testUsersAPI = async () => {
  loading.users = true
  errors.users = ''
  
  try {
    const response = await httpService.get<User[]>('/users')
    if (response.success) {
      results.users = response.data || []
      console.log('Users API Response:', response)
    } else {
      errors.users = response.message || 'API 請求失敗'
    }
  } catch (error: any) {
    errors.users = error.message || '網路錯誤'
    console.error('Users API Error:', error)
  } finally {
    loading.users = false
  }
}

const testSkillsAPI = async () => {
  loading.skills = true
  errors.skills = ''
  
  try {
    const response = await httpService.get<Skill[]>('/skills')
    if (response.success) {
      results.skills = response.data || []
      console.log('Skills API Response:', response)
    } else {
      errors.skills = response.message || 'API 請求失敗'
    }
  } catch (error: any) {
    errors.skills = error.message || '網路錯誤'
    console.error('Skills API Error:', error)
  } finally {
    loading.skills = false
  }
}

const testProfilesAPI = async () => {
  loading.profiles = true
  errors.profiles = ''
  
  try {
    const response = await httpService.get<PersonalProfile[]>('/personalprofiles')
    if (response.success) {
      results.profiles = response.data || []
      console.log('Profiles API Response:', response)
    } else {
      errors.profiles = response.message || 'API 請求失敗'
    }
  } catch (error: any) {
    errors.profiles = error.message || '網路錯誤'
    console.error('Profiles API Error:', error)
  } finally {
    loading.profiles = false
  }
}

const testDemoLogin = async () => {
  loading.demoLogin = true
  errors.demoLogin = ''
  
  try {
    const response = await authService.demoLogin()
    if (response.success) {
      results.demoLogin = response.data
      console.log('Demo Login Response:', response)
    } else {
      errors.demoLogin = response.message || 'Demo 登入失敗'
    }
  } catch (error: any) {
    errors.demoLogin = error.message || '登入錯誤'
    console.error('Demo Login Error:', error)
  } finally {
    loading.demoLogin = false
  }
}

const testAllAPIs = async () => {
  await Promise.all([
    testUsersAPI(),
    testSkillsAPI(),
    testProfilesAPI(),
    testDemoLogin()
  ])
}
</script>