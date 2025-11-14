<script setup lang="ts">
import { useInfiniteScroll } from '@vueuse/core'
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from '~/components/Header.vue'
import { isAtBottom } from '~/shared/states'

interface Props {
  title: string
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  showBack: true,
})

const route = useRoute()

// 获取 main 元素的引用
const mainElement = useTemplateRef<HTMLElement>('mainElement')

// 无限滚动配置
useInfiniteScroll(
  mainElement,
  () => {
    // 当滚动到底部时，设置 isAtBottom 为 true
    isAtBottom.value = true
  },
  {
    distance: 10, // 距离底部 10px 时触发
    canLoadMore: () => {
      // 只有当 isAtBottom 为 false 时才允许触发（避免重复触发）
      return !isAtBottom.value
    },
  },
)

// 监听路由变化，重置 isAtBottom 状态
watch(() => route.path, () => {
  isAtBottom.value = false
})

// 组件挂载时重置状态
onMounted(() => {
  isAtBottom.value = false
})

// 组件卸载时重置状态
onUnmounted(() => {
  isAtBottom.value = false
})

watchEffect(() => {
  console.log(isAtBottom.value)
})
</script>

<template>
  <div class="grid grid-rows-[min-content_1fr] h-screen overflow-hidden">
    <!-- Header -->
    <Header :title="title" :show-back="showBack" />

    <!-- 内容区域 -->
    <main ref="mainElement" class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
