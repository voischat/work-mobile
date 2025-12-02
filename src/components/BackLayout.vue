<script setup lang="ts">
import { useInfiniteScroll } from '@vueuse/core'
import { onMounted, onUnmounted, useSlots, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from '~/components/Header.vue'
import Sidebar from '~/components/Sidebar.vue'
import { isAtBottom } from '~/shared/states'

interface Props {
  title: string
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  showBack: true,
})

const slots = useSlots()

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
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-screen bg-gray-50">
    <!-- Sidebar (desktop only) -->
    <Sidebar class="hidden lg:block" />

    <!-- Main content area -->
    <!-- NOTE: do not use h-screen here -->
    <div class="flex-1 flex flex-col max-h-screen overflow-y-auto">
      <!-- Header (mobile only) -->
      <Header class="lg:hidden" :title="title" :show-back="showBack" :show-exit="true" />

      <div v-if="slots.breadcrumb" class="px-4 py-2 bg-white border-b border-gray-100">
        <slot name="breadcrumb" />
      </div>

      <main ref="mainElement" class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
