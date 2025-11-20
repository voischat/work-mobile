<script setup lang="ts">
import { useRouter } from 'vue-router'
import { bridge } from '~/utils/bridge'

interface Props {
  title?: string
  showBack?: boolean
  showExit?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '微喇',
  showBack: true,
  showExit: false,
})

const router = useRouter()

function handleBack() {
  router.back()
}

function handleExit() {
  bridge.exit()
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-white border-b border-gray-200">
    <div class="relative flex items-center h-14 px-4">
      <!-- 返回按钮 -->
      <button
        v-if="showBack"
        class="bg-transparent p-2 -ml-2 text-gray-600 hover:text-gray-900"
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
      <!-- 标题 - 绝对居中 -->
      <h1 class="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-900">
        {{ title }}
      </h1>
      <!-- 退出按钮 -->
      <button
        v-if="showExit"
        class="bg-transparent ml-auto p-2 -mr-2 text-gray-600 hover:text-gray-900"
        @click="handleExit"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </header>
</template>
