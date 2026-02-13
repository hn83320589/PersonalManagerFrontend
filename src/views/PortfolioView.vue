<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">作品集</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          展示我的專案作品與技術成果，涵蓋不同技術領域與解決方案
        </p>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <BaseInput
              v-model="searchKeyword"
              type="search"
              placeholder="搜尋作品..."
              @input="handleSearch"
            />
          </div>
          <div class="sm:w-48">
            <select
              v-model="selectedTechnology"
              class="input-primary w-full"
              @change="filterByTechnology"
            >
              <option value="">所有技術</option>
              <option v-for="tech in availableTechnologies" :key="tech" :value="tech">
                {{ tech }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="portfolioStore.isLoading" class="text-center py-12">
        <LoadingSpinner size="large" text="載入作品中..." />
      </div>

      <!-- Error State -->
      <div v-else-if="portfolioStore.error" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p class="text-red-600">{{ portfolioStore.error }}</p>
          <BaseButton
            @click="retryFetch"
            variant="outline"
            size="small"
            class="mt-4"
          >
            重新載入
          </BaseButton>
        </div>
      </div>

      <!-- Portfolio Grid -->
      <div v-else-if="portfolioStore.portfolios.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="portfolio in portfolioStore.portfolios"
          :key="portfolio.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
          @click="viewPortfolio(portfolio.id)"
        >
          <!-- Portfolio Image -->
          <div class="aspect-video bg-gray-200 relative overflow-hidden">
            <img
              v-if="portfolio.imageUrl"
              :src="portfolio.imageUrl"
              :alt="portfolio.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex items-center justify-center h-full">
              <BriefcaseIcon class="h-16 w-16 text-gray-400" />
            </div>
            
            <!-- Featured Badge -->
            <div
              v-if="portfolio.isFeatured"
              class="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium"
            >
              精選
            </div>
          </div>

          <!-- Portfolio Content -->
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ portfolio.title }}
            </h3>
            
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">
              {{ portfolio.description }}
            </p>

            <!-- Technology Tags -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tech in getTechnologyTags(portfolio.technologies)"
                :key="tech"
                class="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
              >
                {{ tech }}
              </span>
            </div>

            <!-- Project Links -->
            <div class="flex gap-3">
              <a
                v-if="portfolio.projectUrl"
                :href="portfolio.projectUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                @click.stop
              >
                <ArrowTopRightOnSquareIcon class="inline h-4 w-4 mr-1" />
                查看專案
              </a>
              <a
                v-if="portfolio.repositoryUrl"
                :href="portfolio.repositoryUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-600 hover:text-gray-700 text-sm font-medium"
                @click.stop
              >
                <CodeBracketIcon class="inline h-4 w-4 mr-1" />
                查看代碼
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <BriefcaseIcon class="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">沒有找到作品</h3>
        <p class="text-gray-500">
          {{ searchKeyword || selectedTechnology ? '請嘗試不同的搜尋條件' : '目前還沒有作品展示' }}
        </p>
        <BaseButton
          v-if="searchKeyword || selectedTechnology"
          @click="clearFilters"
          variant="outline"
          size="small"
          class="mt-4"
        >
          清除篩選
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BriefcaseIcon,
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon
} from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { usePortfolioStore } from '@/stores/portfolio'

const router = useRouter()
const portfolioStore = usePortfolioStore()

const searchKeyword = ref('')
const selectedTechnology = ref('')

// Compute available technologies from portfolios
const availableTechnologies = computed(() => {
  const techs = new Set<string>()
  portfolioStore.portfolios.forEach(portfolio => {
    if (portfolio.technologies) {
      portfolio.technologies.split(',').forEach(tech => {
        techs.add(tech.trim())
      })
    }
  })
  return Array.from(techs).sort()
})

function getTechnologyTags(technologies?: string) {
  if (!technologies) return []
  return technologies.split(',').map(tech => tech.trim()).slice(0, 4)
}

function handleSearch() {
  // Client-side search - portfolios are already loaded
  portfolioStore.fetchPortfolios()
}

function filterByTechnology() {
  if (selectedTechnology.value) {
    // This would need to be implemented in the portfolio service
    // For now, we'll filter client-side
    portfolioStore.fetchPortfolios()
  } else {
    portfolioStore.fetchPortfolios()
  }
}

function clearFilters() {
  searchKeyword.value = ''
  selectedTechnology.value = ''
  portfolioStore.fetchPortfolios()
}

function viewPortfolio(id: number) {
  router.push(`/portfolio/${id}`)
}

function retryFetch() {
  portfolioStore.clearError()
  portfolioStore.fetchPortfolios()
}

onMounted(() => {
  portfolioStore.fetchPortfolios()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>