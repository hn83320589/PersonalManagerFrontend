<template>
  <component
    :is="tag"
    v-show="shouldShow"
    :class="containerClasses"
    :style="containerStyles"
  >
    <slot 
      v-bind="{
        breakpoint: currentBreakpoint,
        isMobile,
        isTablet,
        isDesktop,
        windowSize,
        orientation
      }"
    ></slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResponsive, type Breakpoint } from '@/composables/useResponsive'

interface Props {
  // 基本屬性
  tag?: string
  
  // 顯示條件
  showOn?: Breakpoint | Breakpoint[]
  hideOn?: Breakpoint | Breakpoint[]
  showOnMobile?: boolean
  showOnTablet?: boolean
  showOnDesktop?: boolean
  
  // 尺寸條件
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  
  // 響應式樣式
  padding?: Partial<Record<Breakpoint, string | number>>
  margin?: Partial<Record<Breakpoint, string | number>>
  
  // 響應式佈局
  display?: Partial<Record<Breakpoint, 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'none'>>
  flexDirection?: Partial<Record<Breakpoint, 'row' | 'column' | 'row-reverse' | 'column-reverse'>>
  justifyContent?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>>
  alignItems?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'stretch' | 'baseline'>>
  
  // 響應式網格
  gridCols?: Partial<Record<Breakpoint, number>>
  gridGap?: Partial<Record<Breakpoint, string | number>>
  
  // 自定義類名
  class?: string | Record<string, boolean> | Array<string | Record<string, boolean>>
  responsiveClass?: Partial<Record<Breakpoint, string>>
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'div',
  showOnMobile: true,
  showOnTablet: true,
  showOnDesktop: true
})

const {
  currentBreakpoint,
  windowSize,
  orientation,
  isMobile,
  isTablet,
  isDesktop,
  getResponsiveValue
} = useResponsive()

// 顯示條件判斷
const shouldShow = computed(() => {
  // 檢查斷點顯示/隱藏
  if (props.showOn) {
    const showBreakpoints = Array.isArray(props.showOn) ? props.showOn : [props.showOn]
    if (!showBreakpoints.includes(currentBreakpoint.value)) {
      return false
    }
  }
  
  if (props.hideOn) {
    const hideBreakpoints = Array.isArray(props.hideOn) ? props.hideOn : [props.hideOn]
    if (hideBreakpoints.includes(currentBreakpoint.value)) {
      return false
    }
  }
  
  // 檢查設備類型
  if (!props.showOnMobile && isMobile.value) return false
  if (!props.showOnTablet && isTablet.value) return false
  if (!props.showOnDesktop && isDesktop.value) return false
  
  // 檢查尺寸條件
  const { width, height } = windowSize.value
  if (props.minWidth && width < props.minWidth) return false
  if (props.maxWidth && width > props.maxWidth) return false
  if (props.minHeight && height < props.minHeight) return false
  if (props.maxHeight && height > props.maxHeight) return false
  
  return true
})

// 響應式樣式計算
const containerStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  // 邊距和內距
  if (props.padding) {
    const padding = getResponsiveValue(props.padding, '0')
    styles.padding = typeof padding === 'number' ? `${padding}px` : padding
  }
  
  if (props.margin) {
    const margin = getResponsiveValue(props.margin, '0')
    styles.margin = typeof margin === 'number' ? `${margin}px` : margin
  }
  
  // 佈局
  if (props.display) {
    styles.display = getResponsiveValue(props.display, 'block')
  }
  
  if (props.flexDirection && styles.display?.includes('flex')) {
    styles.flexDirection = getResponsiveValue(props.flexDirection, 'row')
  }
  
  if (props.justifyContent && styles.display?.includes('flex')) {
    const justifyMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly'
    }
    const justify = getResponsiveValue(props.justifyContent, 'start')
    styles.justifyContent = justifyMap[justify]
  }
  
  if (props.alignItems && styles.display?.includes('flex')) {
    const alignMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
      baseline: 'baseline'
    }
    const align = getResponsiveValue(props.alignItems, 'stretch')
    styles.alignItems = alignMap[align]
  }
  
  // 網格
  if (props.gridCols && styles.display === 'grid') {
    const cols = getResponsiveValue(props.gridCols, 1)
    styles.gridTemplateColumns = `repeat(${cols}, 1fr)`
  }
  
  if (props.gridGap && styles.display === 'grid') {
    const gap = getResponsiveValue(props.gridGap, '1rem')
    styles.gap = typeof gap === 'number' ? `${gap}px` : gap
  }
  
  return styles
})

// 響應式類名計算
const containerClasses = computed(() => {
  const classes: (string | Record<string, boolean>)[] = []
  
  // 基本類名
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else {
      classes.push(props.class)
    }
  }
  
  // 響應式類名
  if (props.responsiveClass) {
    const responsiveClass = getResponsiveValue(props.responsiveClass, '')
    if (responsiveClass) {
      classes.push(responsiveClass)
    }
  }
  
  // 斷點類名
  classes.push(`breakpoint-${currentBreakpoint.value}`)
  
  // 設備類名
  if (isMobile.value) classes.push('mobile')
  if (isTablet.value) classes.push('tablet')
  if (isDesktop.value) classes.push('desktop')
  
  // 方向類名
  classes.push(`orientation-${orientation.value}`)
  
  return classes
})
</script>

<style scoped>
/* 基礎樣式 */
.mobile {
  --container-type: mobile;
}

.tablet {
  --container-type: tablet;
}

.desktop {
  --container-type: desktop;
}

.orientation-portrait {
  --orientation: portrait;
}

.orientation-landscape {
  --orientation: landscape;
}

/* 斷點樣式 */
.breakpoint-xs {
  --current-breakpoint: xs;
}

.breakpoint-sm {
  --current-breakpoint: sm;
}

.breakpoint-md {
  --current-breakpoint: md;
}

.breakpoint-lg {
  --current-breakpoint: lg;
}

.breakpoint-xl {
  --current-breakpoint: xl;
}

.breakpoint-2xl {
  --current-breakpoint: 2xl;
}

/* 工具類樣式 */
.responsive-hidden {
  display: none !important;
}

.responsive-visible {
  display: block !important;
}

/* 過渡動畫 */
.responsive-transition {
  transition: all 0.3s ease-in-out;
}

/* 響應式邊距和內距工具類 */
@media (max-width: 639px) {
  .responsive-p-sm { padding: 0.5rem; }
  .responsive-m-sm { margin: 0.5rem; }
}

@media (min-width: 640px) and (max-width: 767px) {
  .responsive-p-md { padding: 1rem; }
  .responsive-m-md { margin: 1rem; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .responsive-p-lg { padding: 1.5rem; }
  .responsive-m-lg { margin: 1.5rem; }
}

@media (min-width: 1024px) {
  .responsive-p-xl { padding: 2rem; }
  .responsive-m-xl { margin: 2rem; }
}
</style>