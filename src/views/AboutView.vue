<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            About Me
          </h1>
          <p class="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Get to know more about my journey, values, and what drives me to create amazing experiences.
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div v-if="isLoading" class="flex justify-center">
        <LoadingSpinner />
      </div>

      <div v-else-if="profile" class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <!-- Profile Image and Basic Info -->
        <div class="lg:col-span-1">
          <BaseCard class="text-center">
            <div class="space-y-6">
              <div>
                <img
                  v-if="profile.avatarUrl"
                  :src="profile.avatarUrl"
                  :alt="profile.fullName"
                  class="w-48 h-48 rounded-full mx-auto object-cover border-4 border-primary-100"
                />
                <div v-else class="w-48 h-48 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                  <UserIcon class="w-24 h-24 text-gray-400" />
                </div>
              </div>

              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ profile.fullName }}</h2>
                <p v-if="profile.title" class="text-lg text-primary-600 font-medium">
                  {{ profile.title }}
                </p>
              </div>

              <!-- Contact Information -->
              <div v-if="contactMethods.length > 0" class="space-y-3">
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Contact
                </h3>
                <div class="space-y-2">
                  <a
                    v-for="contact in contactMethods"
                    :key="contact.id"
                    :href="getContactLink(contact)"
                    class="flex items-center justify-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <component :is="getContactIcon(contact.type)" class="w-5 h-5" />
                    <span>{{ contact.label || contact.value }}</span>
                  </a>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Biography and Details -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Bio Section -->
          <BaseCard v-if="profile.bio" title="Biography">
            <div class="prose prose-lg max-w-none text-gray-700">
              <p class="whitespace-pre-line">{{ profile.bio }}</p>
            </div>
          </BaseCard>

          <!-- Skills Summary -->
          <BaseCard v-if="expertSkills.length > 0" title="Core Expertise">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="skill in expertSkills"
                :key="skill.id"
                class="flex items-center space-x-2"
              >
                <div class="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span class="text-gray-700 font-medium">{{ skill.name }}</span>
              </div>
            </div>
          </BaseCard>

          <!-- Current Position -->
          <BaseCard v-if="currentPosition" title="Current Position">
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ currentPosition.position }}
              </h3>
              <p class="text-primary-600 font-medium">
                {{ currentPosition.companyName }}
              </p>
              <p v-if="currentPosition.location" class="text-gray-600">
                📍 {{ currentPosition.location }}
              </p>
              <p v-if="currentPosition.description" class="text-gray-700 mt-4">
                {{ currentPosition.description }}
              </p>
            </div>
          </BaseCard>

          <!-- Latest Education -->
          <BaseCard v-if="latestEducation" title="Education">
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ latestEducation.degree }}
                <span v-if="latestEducation.major">in {{ latestEducation.major }}</span>
              </h3>
              <p class="text-primary-600 font-medium">
                {{ latestEducation.schoolName }}
              </p>
              <p class="text-gray-600">
                {{ latestEducation.startYear }}
                <span v-if="latestEducation.endYear">- {{ latestEducation.endYear }}</span>
                <span v-else>- Present</span>
              </p>
            </div>
          </BaseCard>

          <!-- Call to Action -->
          <BaseCard class="bg-primary-50 border-primary-200">
            <div class="text-center space-y-4">
              <h3 class="text-xl font-semibold text-gray-900">
                Let's Work Together
              </h3>
              <p class="text-gray-600">
                Interested in collaborating or have a project in mind? I'd love to hear from you.
              </p>
              <div class="flex justify-center space-x-4">
                <router-link to="/contact">
                  <BaseButton variant="primary">
                    Get In Touch
                  </BaseButton>
                </router-link>
                <router-link to="/portfolio">
                  <BaseButton variant="outline">
                    View My Work
                  </BaseButton>
                </router-link>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600">Unable to load profile information.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/vue/24/outline'
import { useProfileStore } from '@/stores/profile'
import { useExperienceStore } from '@/stores/experience'
import { useSkillStore } from '@/stores/skill'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { ContactMethod, ContactType } from '@/types/api'

// Stores
const profileStore = useProfileStore()
const experienceStore = useExperienceStore()
const skillStore = useSkillStore()

// State
const isLoading = ref(true)
const contactMethods = ref<ContactMethod[]>([])

// Computed
const profile = computed(() => profileStore.publicProfile)
const currentPosition = computed(() => experienceStore.currentPosition)
const latestEducation = computed(() => 
  experienceStore.publicEducations[0] // Assuming sorted by most recent
)
const expertSkills = computed(() => skillStore.expertSkills.slice(0, 6))

// Methods
function getContactIcon(type: ContactType) {
  const icons = {
    [0]: EnvelopeIcon, // Email
    [1]: PhoneIcon,    // Phone
    [2]: 'LinkedIn',   // LinkedIn - would need custom icon
    [3]: 'GitHub',     // GitHub - would need custom icon
    [4]: 'Facebook',   // Facebook - would need custom icon
    [5]: 'Twitter',    // Twitter - would need custom icon
    [6]: 'Instagram',  // Instagram - would need custom icon
    [7]: EnvelopeIcon, // Other
  }
  return icons[type] || EnvelopeIcon
}

function getContactLink(contact: ContactMethod) {
  switch (contact.type) {
    case 0: // Email
      return `mailto:${contact.value}`
    case 1: // Phone
      return `tel:${contact.value}`
    case 2: // LinkedIn
      return contact.value.startsWith('http') ? contact.value : `https://linkedin.com/in/${contact.value}`
    case 3: // GitHub
      return contact.value.startsWith('http') ? contact.value : `https://github.com/${contact.value}`
    default:
      return contact.value.startsWith('http') ? contact.value : `https://${contact.value}`
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      profileStore.fetchPublicProfile(),
      experienceStore.fetchWorkExperiences(),
      experienceStore.fetchEducations(),
      skillStore.fetchSkills(),
    ])
    
    // TODO: Fetch contact methods when service is available
    // contactMethods.value = await contactService.getPublicContactMethods()
  } catch (error) {
    console.error('Failed to load about page data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
