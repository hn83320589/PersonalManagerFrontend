<template>
  <div 
    :class="[
      'relative overflow-hidden',
      containerClass
    ]"
  >
    <!-- Loading placeholder -->
    <div
      v-if="!isLoaded && !isError"
      :class="[
        'absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse',
        placeholderClass
      ]"
    >
      <div class="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>

    <!-- Error placeholder -->
    <div
      v-if="isError && !isLoaded"
      :class="[
        'absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400',
        placeholderClass
      ]"
    >
      <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
      </svg>
    </div>

    <!-- Actual image -->
    <img
      ref="imageRef"
      :alt="alt"
      :class="[
        'transition-opacity duration-300',
        imageClass,
        {
          'opacity-0': !isLoaded,
          'opacity-100': isLoaded
        }
      ]"
      @load="handleLoad"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  alt: string
  placeholder?: string
  containerClass?: string
  imageClass?: string
  placeholderClass?: string
  lazy?: boolean
  rootMargin?: string
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  containerClass: '',
  imageClass: 'w-full h-full object-cover',
  placeholderClass: '',
  lazy: true,
  rootMargin: '50px 0px',
  threshold: 0.01,
})

const imageRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const isError = ref(false)
const observer = ref<IntersectionObserver | null>(null)

const handleLoad = () => {
  isLoaded.value = true
}

const handleError = () => {
  isError.value = true
}

const loadImage = () => {
  if (!imageRef.value) return
  
  imageRef.value.src = props.src
}

const setupLazyLoading = () => {
  if (!imageRef.value) return

  if (props.lazy && 'IntersectionObserver' in window) {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage()
            observer.value?.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: props.rootMargin,
        threshold: props.threshold,
      }
    )
    
    observer.value.observe(imageRef.value)
  } else {
    // Load immediately if lazy loading is disabled or not supported
    loadImage()
  }
}

onMounted(() => {
  setupLazyLoading()
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<style scoped>
.lazy-loaded {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>