<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  title: string
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  showBack: true,
})

const router = useRouter()

function handleBack() {
  router.back()
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-white border-b border-gray-200">
    <div class="flex items-center h-14 px-4">
      <!-- 返回按钮 -->
      <button
        v-if="showBack"
        class="mr-3 p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
        @click="handleBack"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <!-- 标题 -->
      <h1 class="flex-1 text-lg font-semibold text-gray-900">
        {{ title }}
      </h1>
    </div>
  </header>
</template>
