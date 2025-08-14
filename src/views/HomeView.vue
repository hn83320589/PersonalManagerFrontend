<template>
  <div class="bg-gray-50">
    <!-- API Test Component (開發用) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6" v-if="isDevelopment">
      <ApiTestComponent />
    </div>

    <!-- Hero Section -->
    <section class="relative bg-white overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            class="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main class="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div class="sm:text-center lg:text-left">
              <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span class="block xl:inline">歡迎來到</span>
                <span class="block text-primary-600 xl:inline">Personal Manager</span>
              </h1>
              <p class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                一個整合個人資料管理、作品展示、部落格與任務追蹤的現代化平台。讓您輕鬆管理個人品牌與工作流程。
              </p>
              <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div class="rounded-md shadow">
                  <RouterLink to="/portfolio">
                    <BaseButton variant="primary" size="large">
                      查看作品集
                    </BaseButton>
                  </RouterLink>
                </div>
                <div class="mt-3 sm:mt-0 sm:ml-3">
                  <RouterLink to="/about">
                    <BaseButton variant="outline" size="large">
                      了解更多
                    </BaseButton>
                  </RouterLink>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          class="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Personal workspace"
        />
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center">
          <h2 class="text-base text-primary-600 font-semibold tracking-wide uppercase">功能特色</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            全方位的個人管理解決方案
          </p>
          <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            整合多種功能，打造專屬於您的數位工作空間
          </p>
        </div>

        <div class="mt-10">
          <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div v-for="feature in features" :key="feature.name" class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <component :is="feature.icon" class="h-6 w-6" aria-hidden="true" />
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">{{ feature.name }}</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                {{ feature.description }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- Portfolio Preview -->
    <section class="py-12 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center mb-12">
          <h2 class="text-3xl font-extrabold text-gray-900">精選作品</h2>
          <p class="mt-4 text-lg text-gray-500">
            展示最新的專案與技術成果
          </p>
        </div>

        <LoadingSpinner v-if="portfolioStore.isLoading" size="medium" text="載入作品中..." />
        
        <div v-else-if="portfolioStore.featuredPortfolios.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="portfolio in portfolioStore.featuredPortfolios.slice(0, 3)"
            :key="portfolio.id"
            class="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            @click="$router.push(`/portfolio/${portfolio.id}`)"
          >
            <img
              v-if="portfolio.imageUrl"
              :src="portfolio.imageUrl"
              :alt="portfolio.title"
              class="w-full h-48 object-cover rounded-t-lg"
            />
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ portfolio.title }}</h3>
              <p class="text-gray-600 text-sm mb-3">{{ portfolio.description?.substring(0, 100) }}...</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tech in portfolio.technologyUsed?.split(',').slice(0, 3)"
                  :key="tech"
                  class="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded"
                >
                  {{ tech.trim() }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center text-gray-500">
          <p>目前沒有精選作品</p>
        </div>

        <div class="mt-8 text-center">
          <RouterLink to="/portfolio">
            <BaseButton variant="outline">
              查看所有作品
            </BaseButton>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-primary-600">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span class="block">準備開始了嗎？</span>
          <span class="block text-primary-200">聯繫我討論您的專案。</span>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <RouterLink to="/contact">
              <BaseButton variant="secondary" size="large">
                聯絡我
              </BaseButton>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  BriefcaseIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon 
} from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ApiTestComponent from '@/components/debug/ApiTestComponent.vue'
import { usePortfolioStore } from '@/stores/portfolio'

const portfolioStore = usePortfolioStore()

// 只在開發環境顯示API測試組件
const isDevelopment = computed(() => import.meta.env.VITE_APP_ENV === 'development')

const features = [
  {
    name: '作品集管理',
    description: '展示您的專案作品，包含技術細節、專案連結與成果展示。',
    icon: BriefcaseIcon,
  },
  {
    name: '行事曆整合',
    description: '管理個人與工作行程，支援Google行事曆同步功能。',
    icon: CalendarIcon,
  },
  {
    name: '任務追蹤',
    description: '追蹤工作進度與待辦事項，提升工作效率與時間管理。',
    icon: ChartBarIcon,
  },
  {
    name: '部落格系統',
    description: '分享技術文章與個人想法，建立專業的內容輸出平台。',
    icon: DocumentTextIcon,
  },
]

onMounted(() => {
  // Fetch featured portfolios when component mounts
  portfolioStore.fetchFeaturedPortfolios()
})
</script>