<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import BottomNav from '~/components/BottomNav.vue'

const enableHomeLayout = useRouteQuery(
  'enableHomeLayout',
  'true',
  {
    transform: (val: string) => val === 'true',
  },
)
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <!-- 内容区域 -->
    <main class="flex-1 pb-16 overflow-y-auto">
      <slot />
    </main>

    <!-- 底部导航栏 -->
    <BottomNav v-if="enableHomeLayout" />
  </div>
</template>
