// Temporary type fixes to resolve compilation errors
// These should be properly implemented in the future

declare module '@/components/ui/BaseInput.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}

declare module '@/components/ui/BaseTextarea.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}

declare module '@/components/ui/BaseButton.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}

declare module '@/components/ui/BaseModal.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}

// Global type overrides for temporary fixes
declare global {
  interface Window {
    // Add any window extensions here
  }
}

export {}