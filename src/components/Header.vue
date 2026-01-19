<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { bridge } from '~/utils/bridge'
import LanguageSwitcher from './LanguageSwitcher.vue'

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
        <Icon icon="lucide:arrow-left" class="w-6 h-6" />
      </button>
      <!-- 标题 - 绝对居中 -->
      <h1 class="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-900">
        {{ title }}
      </h1>
      <!-- 右侧按钮组 -->
      <div class="ml-auto flex items-center gap-1">
        <LanguageSwitcher />
        <button
          v-if="showExit"
          class="bg-transparent p-2 -mr-2 text-gray-600 hover:text-gray-900"
          @click="handleExit"
        >
          <Icon icon="lucide:x" class="w-6 h-6" />
        </button>
      </div>
    </div>
  </header>
</template>
