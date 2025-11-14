<script setup lang="ts">
import Header from '~/components/Header.vue'

interface Props {
  title: string
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  showBack: true,
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <Header :title="title" :show-back="showBack" />

    <!-- 内容区域 -->
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
