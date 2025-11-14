<script setup lang="ts">
import { computed } from 'vue'

const url = defineModel<string>({ default: '' })

// 头像预览URL（用于显示预览，实际提交时使用 url）
const avatarPreview = computed(() => url.value || '')
</script>

<template>
  <button
    type="button"
    class="w-20 h-20 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors"
  >
    <div v-if="avatarPreview" class="w-full h-full rounded-lg overflow-hidden">
      <img :src="avatarPreview" alt="头像预览" class="w-full h-full object-cover">
    </div>
    <div v-else class="text-3xl text-gray-400">
      +
    </div>
  </button>
</template>
