<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Get in Touch
          </h1>
          <p class="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            I'm always interested in hearing about new opportunities, collaborations, or just having a great conversation. Let's connect!
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div>
          <BaseCard title="Send me a message" class="h-fit">
            <BaseForm @submit="handleSubmit">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInput
                  v-model="form.firstName"
                  label="First Name *"
                  placeholder="John"
                  required
                />
                <BaseInput
                  v-model="form.lastName"
                  label="Last Name *"
                  placeholder="Doe"
                  required
                />
              </div>

              <BaseInput
                v-model="form.email"
                type="email"
                label="Email Address *"
                placeholder="john.doe@example.com"
                required
              />

              <BaseInput
                v-model="form.company"
                label="Company / Organization"
                placeholder="Your company name"
              />

              <BaseSelect
                v-model="form.subject"
                label="Subject *"
                placeholder="Select a topic"
                :options="subjectOptions"
                required
              />

              <BaseInput
                v-model="form.budget"
                label="Project Budget (optional)"
                placeholder="e.g., $5,000 - $10,000"
              />

              <BaseTextarea
                v-model="form.message"
                label="Message *"
                placeholder="Tell me about your project, question, or how I can help you..."
                :rows="6"
                required
              />

              <div class="space-y-4">
                <div class="flex items-center space-x-2">
                  <input
                    id="updates"
                    v-model="form.subscribe"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label for="updates" class="text-sm text-gray-700">
                    Subscribe to updates about my work and new projects
                  </label>
                </div>

                <div class="flex items-center space-x-2">
                  <input
                    id="privacy"
                    v-model="form.privacy"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    required
                  />
                  <label for="privacy" class="text-sm text-gray-700">
                    I agree to the <a href="#" class="text-primary-600 hover:text-primary-500">privacy policy</a> *
                  </label>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4">
                <p class="text-sm text-gray-500">
                  * Required fields
                </p>
                <BaseButton
                  type="submit"
                  :loading="isSubmitting"
                  :disabled="!isFormValid"
                >
                  Send Message
                </BaseButton>
              </div>
            </BaseForm>
          </BaseCard>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <!-- Contact Methods -->
          <BaseCard title="Contact Information">
            <div class="space-y-6">
              <div
                v-for="method in contactMethods"
                :key="method.id"
                class="flex items-start space-x-4"
              >
                <div :class="['p-3 rounded-lg', method.color]">
                  <component :is="method.icon" class="w-6 h-6" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ method.type }}</h3>
                  <p class="text-gray-600 mt-1">{{ method.description }}</p>
                  <div class="mt-2">
                    <a
                      v-if="method.type === 'Email'"
                      :href="`mailto:${method.value}`"
                      class="inline-flex items-center text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      {{ method.value }}
                      <ArrowTopRightOnSquareIcon class="w-4 h-4 ml-1" />
                    </a>
                    <a
                      v-else-if="method.type === 'Phone'"
                      :href="`tel:${method.value}`"
                      class="inline-flex items-center text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      {{ method.value }}
                      <ArrowTopRightOnSquareIcon class="w-4 h-4 ml-1" />
                    </a>
                    <a
                      v-else
                      :href="method.value"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      {{ method.label || method.value }}
                      <ArrowTopRightOnSquareIcon class="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Social Media -->
          <BaseCard title="Follow Me">
            <div class="grid grid-cols-2 gap-4">
              <a
                v-for="social in socialLinks"
                :key="social.name"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                :class="[
                  'flex items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-colors group',
                  social.color
                ]"
              >
                <component :is="social.icon" class="w-6 h-6 mr-3" />
                <span class="font-medium">{{ social.name }}</span>
              </a>
            </div>
          </BaseCard>

          <!-- Quick Contact -->
          <BaseCard title="Quick Contact">
            <div class="space-y-4">
              <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div class="flex items-center space-x-3">
                  <ClockIcon class="w-5 h-5 text-primary-600" />
                  <div>
                    <h4 class="font-medium text-primary-900">Response Time</h4>
                    <p class="text-sm text-primary-700">Usually within 24 hours</p>
                  </div>
                </div>
              </div>

              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center space-x-3">
                  <CheckCircleIcon class="w-5 h-5 text-green-600" />
                  <div>
                    <h4 class="font-medium text-green-900">Currently Available</h4>
                    <p class="text-sm text-green-700">Open to new projects</p>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <BaseButton
                  variant="outline"
                  class="w-full"
                  @click="scrollToForm"
                >
                  <PaperAirplaneIcon class="w-4 h-4 mr-2" />
                  Send Quick Message
                </BaseButton>
                
                <BaseButton
                  variant="outline"
                  class="w-full"
                  @click="downloadResume"
                >
                  <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
                  Download Resume
                </BaseButton>
              </div>
            </div>
          </BaseCard>

          <!-- FAQ -->
          <BaseCard title="Frequently Asked Questions">
            <div class="space-y-4">
              <div
                v-for="(faq, index) in faqs"
                :key="index"
                class="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0"
              >
                <button
                  @click="toggleFaq(index)"
                  class="flex items-start justify-between w-full text-left"
                >
                  <h4 class="font-medium text-gray-900 pr-4">{{ faq.question }}</h4>
                  <ChevronDownIcon
                    :class="[
                      'w-5 h-5 text-gray-500 transition-transform flex-shrink-0',
                      openFaq === index ? 'transform rotate-180' : ''
                    ]"
                  />
                </button>
                <div
                  v-if="openFaq === index"
                  class="mt-2 text-sm text-gray-600"
                >
                  {{ faq.answer }}
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- Success Modal -->
    <BaseModal v-model:show="showSuccessModal" title="Message Sent!" size="medium">
      <div class="text-center py-4">
        <CheckCircleIcon class="mx-auto h-16 w-16 text-green-500 mb-4" />
        <p class="text-gray-700 mb-4">
          Thank you for reaching out! I've received your message and will get back to you soon.
        </p>
        <p class="text-sm text-gray-500">
          I typically respond within 24 hours during business days.
        </p>
      </div>
      <template #footer>
        <div class="flex space-x-3">
          <BaseButton variant="outline" @click="showSuccessModal = false">
            Continue Browsing
          </BaseButton>
          <BaseButton variant="primary" @click="router.push('/blog')">
            Check Out My Blog
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import {
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  HeartIcon
} from '@heroicons/vue/24/solid'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseForm from '@/components/ui/BaseForm.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

// Router
const router = useRouter()

// State
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const openFaq = ref<number | null>(null)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  subject: '',
  budget: '',
  message: '',
  subscribe: false,
  privacy: false
})

// Computed
const isFormValid = computed(() => {
  return form.firstName.trim() && 
         form.lastName.trim() && 
         form.email.trim() && 
         form.subject &&
         form.message.trim() &&
         form.privacy
})

// Data
const subjectOptions = [
  { label: 'Web Development Project', value: 'web-development' },
  { label: 'Mobile App Development', value: 'mobile-development' },
  { label: 'UI/UX Design', value: 'ui-ux-design' },
  { label: 'Consulting & Strategy', value: 'consulting' },
  { label: 'Technical Support', value: 'technical-support' },
  { label: 'Speaking Engagement', value: 'speaking' },
  { label: 'Partnership Opportunity', value: 'partnership' },
  { label: 'Job Opportunity', value: 'job' },
  { label: 'General Inquiry', value: 'general' },
  { label: 'Other', value: 'other' }
]

const contactMethods = [
  {
    id: 1,
    type: 'Email',
    icon: EnvelopeIcon,
    value: 'contact@example.com',
    description: 'Best for detailed inquiries and project discussions',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 2,
    type: 'Phone',
    icon: PhoneIcon,
    value: '+1 (555) 123-4567',
    description: 'For urgent matters or quick consultations',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 3,
    type: 'Location',
    icon: MapPinIcon,
    value: 'San Francisco, CA',
    description: 'Available for local meetings and on-site projects',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 4,
    type: 'LinkedIn',
    icon: BriefcaseIcon,
    value: 'https://linkedin.com/in/yourprofile',
    label: 'Professional Network',
    description: 'Connect for professional networking',
    color: 'bg-blue-100 text-blue-600'
  }
]

const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/yourusername',
    icon: AcademicCapIcon,
    color: 'hover:bg-gray-50'
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/yourprofile',
    icon: BriefcaseIcon,
    color: 'hover:bg-blue-50'
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/yourusername',
    icon: ChatBubbleLeftRightIcon,
    color: 'hover:bg-blue-50'
  },
  {
    name: 'Portfolio',
    url: '/portfolio',
    icon: HeartIcon,
    color: 'hover:bg-primary-50'
  }
]

const faqs = [
  {
    question: 'What types of projects do you work on?',
    answer: 'I specialize in web development, mobile applications, and UI/UX design. I work with both startups and established companies on projects ranging from simple websites to complex web applications.'
  },
  {
    question: 'What\'s your typical project timeline?',
    answer: 'Project timelines vary depending on scope and complexity. Simple websites can take 2-4 weeks, while complex applications may take 3-6 months. I always provide detailed timelines during our initial consultation.'
  },
  {
    question: 'Do you work with international clients?',
    answer: 'Yes! I work with clients worldwide. I\'m comfortable with remote collaboration and have experience working across different time zones.'
  },
  {
    question: 'What\'s your pricing structure?',
    answer: 'I offer both project-based and hourly pricing depending on the scope. I provide detailed quotes after understanding your requirements. Feel free to mention your budget in the contact form.'
  },
  {
    question: 'Do you provide ongoing support?',
    answer: 'Yes, I offer maintenance and support packages for all projects. This includes bug fixes, updates, and feature enhancements as needed.'
  }
]

// Methods
async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return

  try {
    isSubmitting.value = true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real app, you'd call an API here
    console.log('Form submitted:', form)

    // Reset form
    Object.assign(form, {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      subject: '',
      budget: '',
      message: '',
      subscribe: false,
      privacy: false
    })

    showSuccessModal.value = true

  } catch (error) {
    console.error('Failed to submit form:', error)
    // In a real app, you'd show an error toast
  } finally {
    isSubmitting.value = false
  }
}

function scrollToForm() {
  const formElement = document.querySelector('form')
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth' })
  }
}

function downloadResume() {
  // In a real app, this would download the actual resume file
  console.log('Downloading resume...')
  
  // Simulate download
  const link = document.createElement('a')
  link.href = '/resume.pdf' // This would be a real file path
  link.download = 'resume.pdf'
  link.click()
}

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index
}
</script>

<style scoped>
/* Custom styles if needed */
</style>