<template>
  <div :class="gridClasses" :style="gridStyles">
    <slot 
      v-bind="{
        currentCols,
        currentGap,
        currentBreakpoint,
        isMobile,
        isTablet,
        isDesktop
      }"
    ></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResponsive, type Breakpoint } from '@/composables/useResponsive'

interface Props {
  // 響應式列數配置
  cols?: Partial<Record<Breakpoint, number>>
  
  // 響應式間距配置
  gap?: Partial<Record<Breakpoint, string | number>>
  rowGap?: Partial<Record<Breakpoint, string | number>>
  colGap?: Partial<Record<Breakpoint, string | number>>
  
  // 響應式對齊方式
  alignItems?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'stretch'>>
  justifyItems?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'stretch'>>
  alignContent?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around' | 'evenly'>>
  justifyContent?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around' | 'evenly'>>
  
  // 自動行配置
  autoRows?: Partial<Record<Breakpoint, string>>
  autoFlow?: Partial<Record<Breakpoint, 'row' | 'column' | 'dense' | 'row-dense' | 'column-dense'>>
  
  // 額外樣式
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  cols: () => ({
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    '2xl': 6
  }),
  gap: () => ({
    xs: '1rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem'
  })
})

const {
  currentBreakpoint,
  getResponsiveValue,
  isMobile,
  isTablet,
  isDesktop
} = useResponsive()

// 當前響應式值
const currentCols = computed(() => 
  getResponsiveValue(props.cols || {}, 1)
)

const currentGap = computed(() => 
  getResponsiveValue(props.gap || {}, '1rem')
)

const currentRowGap = computed(() => 
  getResponsiveValue(props.rowGap || {}, currentGap.value)
)

const currentColGap = computed(() => 
  getResponsiveValue(props.colGap || {}, currentGap.value)
)

const currentAlignItems = computed(() => 
  getResponsiveValue(props.alignItems || {}, 'stretch')
)

const currentJustifyItems = computed(() => 
  getResponsiveValue(props.justifyItems || {}, 'stretch')
)

const currentAlignContent = computed(() => 
  getResponsiveValue(props.alignContent || {}, 'start')
)

const currentJustifyContent = computed(() => 
  getResponsiveValue(props.justifyContent || {}, 'start')
)

const currentAutoRows = computed(() => 
  getResponsiveValue(props.autoRows || {}, 'auto')
)

const currentAutoFlow = computed(() => 
  getResponsiveValue(props.autoFlow || {}, 'row')
)

// 網格樣式
const gridStyles = computed(() => {
  const styles: Record<string, string> = {
    display: 'grid',
    gridTemplateColumns: `repeat(${currentCols.value}, 1fr)`
  }
  
  // 間距
  const rowGap = currentRowGap.value
  const colGap = currentColGap.value
  
  if (rowGap === colGap) {
    styles.gap = typeof rowGap === 'number' ? `${rowGap}px` : rowGap
  } else {
    styles.rowGap = typeof rowGap === 'number' ? `${rowGap}px` : rowGap
    styles.columnGap = typeof colGap === 'number' ? `${colGap}px` : colGap
  }
  
  // 對齊
  const alignMap = {
    start: 'start',
    center: 'center',
    end: 'end',
    stretch: 'stretch',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly'
  }
  
  styles.alignItems = alignMap[currentAlignItems.value as keyof typeof alignMap]
  styles.justifyItems = alignMap[currentJustifyItems.value as keyof typeof alignMap]
  styles.alignContent = alignMap[currentAlignContent.value as keyof typeof alignMap]
  styles.justifyContent = alignMap[currentJustifyContent.value as keyof typeof alignMap]
  
  // 自動行和流向
  styles.gridAutoRows = currentAutoRows.value
  styles.gridAutoFlow = currentAutoFlow.value
  
  return styles
})

// 網格類名
const gridClasses = computed(() => {
  const classes = ['responsive-grid']
  
  // 斷點類名
  classes.push(`grid-${currentBreakpoint.value}`)
  classes.push(`cols-${currentCols.value}`)
  
  // 設備類名
  if (isMobile.value) classes.push('grid-mobile')
  if (isTablet.value) classes.push('grid-tablet')  
  if (isDesktop.value) classes.push('grid-desktop')
  
  // 自定義類名
  if (props.class) {
    classes.push(props.class)
  }
  
  return classes
})
</script>

<style scoped>
.responsive-grid {
  width: 100%;
}

/* 斷點特定樣式 */
.grid-xs {
  --grid-breakpoint: xs;
}

.grid-sm {
  --grid-breakpoint: sm;
}

.grid-md {
  --grid-breakpoint: md;
}

.grid-lg {
  --grid-breakpoint: lg;
}

.grid-xl {
  --grid-breakpoint: xl;
}

.grid-2xl {
  --grid-breakpoint: 2xl;
}

/* 設備類型樣式 */
.grid-mobile {
  /* 行動裝置特定調整 */
}

.grid-tablet {
  /* 平板特定調整 */
}

.grid-desktop {
  /* 桌面特定調整 */
}

/* 常用網格工具類 */
.cols-1 { --grid-cols: 1; }
.cols-2 { --grid-cols: 2; }
.cols-3 { --grid-cols: 3; }
.cols-4 { --grid-cols: 4; }
.cols-5 { --grid-cols: 5; }
.cols-6 { --grid-cols: 6; }
.cols-12 { --grid-cols: 12; }

/* 響應式間距 */
@media (max-width: 639px) {
  .responsive-grid {
    --grid-gap: 0.75rem;
  }
}

@media (min-width: 640px) and (max-width: 767px) {
  .responsive-grid {
    --grid-gap: 1rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .responsive-grid {
    --grid-gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    --grid-gap: 2rem;
  }
}
</style>