<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="isLoading" class="flex justify-center items-center min-h-screen">
      <LoadingSpinner />
    </div>

    <div v-else-if="project" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Navigation -->
      <div class="mb-8">
        <router-link
          to="/portfolio"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          Back to Portfolio
        </router-link>
      </div>

      <!-- Project Header -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <!-- Project Image -->
        <div v-if="project.imageUrl" class="aspect-w-16 aspect-h-9">
          <img
            :src="project.imageUrl"
            :alt="project.title"
            class="w-full h-96 object-cover"
          />
        </div>

        <!-- Project Info -->
        <div class="p-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Info -->
            <div class="lg:col-span-2">
              <div class="space-y-6">
                <div>
                  <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    {{ project.title }}
                  </h1>
                  <div class="flex items-center space-x-4 text-sm text-gray-600">
                    <span v-if="project.createdAt">
                      📅 {{ formatDate(project.createdAt) }}
                    </span>
                    <span v-if="project.isFeatured" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⭐ Featured
                    </span>
                  </div>
                </div>

                <div v-if="project.description" class="prose prose-lg max-w-none">
                  <p class="text-gray-700 whitespace-pre-line">{{ project.description }}</p>
                </div>

                <!-- Technologies Used -->
                <div v-if="projectTechnologies.length > 0">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">Technologies Used</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tech in projectTechnologies"
                      :key="tech"
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {{ tech }}
                    </span>
                  </div>
                </div>

                <!-- Project Links -->
                <div class="flex flex-wrap gap-4">
                  <a
                    v-if="project.projectUrl"
                    :href="project.projectUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    <GlobeAltIcon class="w-4 h-4 mr-2" />
                    Live Demo
                  </a>

                  <a
                    v-if="project.repositoryUrl"
                    :href="project.repositoryUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <CodeBracketIcon class="w-4 h-4 mr-2" />
                    View Code
                  </a>
                </div>
              </div>
            </div>

            <!-- Sidebar Info -->
            <div class="lg:col-span-1">
              <BaseCard title="Project Details">
                <div class="space-y-4">
                  <!-- Created Date -->
                  <div v-if="project.createdAt">
                    <h4 class="text-sm font-medium text-gray-900">Created</h4>
                    <p class="text-sm text-gray-600">
                      {{ formatDate(project.createdAt) }}
                    </p>
                  </div>

                  <!-- Visibility -->
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Visibility</h4>
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        project.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ project.isPublic ? 'Public' : 'Private' }}
                    </span>
                  </div>

                  <!-- Project Links in Sidebar -->
                  <div v-if="project.projectUrl || project.repositoryUrl">
                    <h4 class="text-sm font-medium text-gray-900 mb-2">Links</h4>
                    <div class="space-y-2">
                      <a
                        v-if="project.projectUrl"
                        :href="project.projectUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center text-sm text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <GlobeAltIcon class="w-4 h-4 mr-2" />
                        Live Project
                      </a>
                      <a
                        v-if="project.repositoryUrl"
                        :href="project.repositoryUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <CodeBracketIcon class="w-4 h-4 mr-2" />
                        Source Code
                      </a>
                    </div>
                  </div>
                </div>
              </BaseCard>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Projects -->
      <section v-if="relatedProjects.length > 0">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Related Projects</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <router-link
              v-for="relatedProject in relatedProjects"
              :key="relatedProject.id"
              :to="`/portfolio/${relatedProject.id}`"
              class="group"
            >
              <BaseCard hoverable clickable>
                <div class="space-y-3">
                  <div v-if="relatedProject.imageUrl" class="aspect-w-16 aspect-h-9">
                    <img
                      :src="relatedProject.imageUrl"
                      :alt="relatedProject.title"
                      class="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {{ relatedProject.title }}
                    </h3>
                    <p class="text-sm text-gray-600 line-clamp-2">
                      {{ relatedProject.description }}
                    </p>
                  </div>
                </div>
              </BaseCard>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section>
        <BaseCard class="bg-primary-50 border-primary-200">
          <div class="text-center space-y-4">
            <h3 class="text-xl font-semibold text-gray-900">
              Interested in Working Together?
            </h3>
            <p class="text-gray-600">
              I'm always open to discussing new projects and opportunities.
            </p>
            <div class="flex justify-center space-x-4">
              <router-link to="/contact">
                <BaseButton variant="primary">
                  Get In Touch
                </BaseButton>
              </router-link>
              <router-link to="/portfolio">
                <BaseButton variant="outline">
                  View All Projects
                </BaseButton>
              </router-link>
            </div>
          </div>
        </BaseCard>
      </section>
    </div>

    <!-- Error State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <ExclamationTriangleIcon class="mx-auto h-16 w-16 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Project Not Found</h3>
        <p class="mt-2 text-gray-500">The project you're looking for doesn't exist or has been removed.</p>
        <div class="mt-6">
          <router-link to="/portfolio">
            <BaseButton variant="primary">
              Back to Portfolio
            </BaseButton>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeftIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { usePortfolioStore } from '@/stores/portfolio'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

// Router
const route = useRoute()

// Stores
const portfolioStore = usePortfolioStore()

// State
const isLoading = ref(true)

// Computed
const project = computed(() => portfolioStore.currentPortfolio)
const allProjects = computed(() => portfolioStore.portfolios)

const projectTechnologies = computed(() => {
  if (!project.value?.technologies) return []
  return project.value.technologies.split(',').map(t => t.trim()).filter(Boolean)
})

const relatedProjects = computed(() => {
  if (!project.value) return []
  
  // Find projects with similar technologies or category
  return allProjects.value
    .filter(p => p.id !== project.value!.id && p.isPublic)
    .slice(0, 3) // Show max 3 related projects
})

// Methods
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
}

// Lifecycle
onMounted(async () => {
  const projectId = parseInt(route.params.id as string)
  
  if (isNaN(projectId)) {
    isLoading.value = false
    return
  }

  try {
    await Promise.all([
      portfolioStore.fetchPortfolioById(projectId),
      portfolioStore.fetchPortfolios() // For related projects
    ])
  } catch (error) {
    console.error('Failed to load project:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.aspect-w-16 > img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>