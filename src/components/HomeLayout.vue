<script setup lang="ts">
import BottomNav from '~/components/BottomNav.vue'
import Header from '~/components/Header.vue'

const isDev = import.meta.env.DEV
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <!-- Header -->
    <Header :show-back="false" :show-exit="true" />

    <!-- 内容区域 -->
    <main class="flex-1 pb-16 overflow-y-auto">
      <slot />
    </main>

    <!-- 底部导航栏 -->
    <BottomNav v-if="isDev" />
  </div>
</template>
