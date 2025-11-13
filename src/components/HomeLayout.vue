<script setup lang="ts">
import BottomNav from '~/components/BottomNav.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <!-- 内容区域 -->
    <main class="flex-1 pb-16 overflow-y-auto">
      <slot />
    </main>

    <!-- 底部导航栏 -->
    <BottomNav />
  </div>
</template>
