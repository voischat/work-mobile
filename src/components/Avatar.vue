<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'rounded' | 'circle'
}>(), {
  src: '',
  alt: '',
  size: 'md',
  shape: 'rounded',
})

// 头像加载错误状态
const avatarError = ref(false)

// 处理头像加载错误
function handleAvatarError() {
  avatarError.value = true
}

// 当 src 变化时，重置头像错误状态
watch(() => props.src, () => {
  avatarError.value = false
})

// 判断是否有有效的 src
const hasSrc = computed(() => !!props.src && props.src.trim() !== '')

// 尺寸映射
const sizeMap = {
  sm: 'size-10',
  md: 'size-14',
  lg: 'size-16',
  xl: 'size-20',
} as const

// 形状映射
const shapeMap = {
  rounded: 'rounded',
  circle: 'rounded-full',
} as const

// 图标尺寸映射
const iconSizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
} as const
</script>

<template>
  <div
    class="flex-shrink-0 flex items-center justify-center bg-gray-100"
    :class="[
      sizeMap[size],
      shapeMap[shape],
    ]"
  >
    <!-- 头像图片 -->
    <img
      v-if="!avatarError && hasSrc"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover"
      :class="shapeMap[shape]"
      @error="handleAvatarError"
    >
    <!-- 错误图标（图片加载失败时显示） -->
    <svg
      v-else-if="avatarError && hasSrc"
      class="text-red-400"
      :class="iconSizeMap[size]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <!-- 默认图标（没有 src 时显示） -->
    <svg
      v-else
      class="text-gray-400"
      :class="iconSizeMap[size]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  </div>
</template>
