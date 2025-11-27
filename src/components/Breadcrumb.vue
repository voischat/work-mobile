<script setup lang="ts">
import { useRouter } from 'vue-router'

interface BreadcrumbItem {
  name: string // 显示名称
  steps?: number // 回退步数，router.go(-steps)
}

interface Props {
  items: BreadcrumbItem[]
  separator?: string
}

withDefaults(defineProps<Props>(), {
  separator: '/',
})

const router = useRouter()

function handleClick(steps: number) {
  router.go(-steps)
}
</script>

<template>
  <nav class="flex items-center space-x-2 text-sm text-gray-600">
    <template v-for="(item, index) in items" :key="index">
      <button
        v-if="item.steps !== undefined"
        class="hover:text-blue-600 transition-colors duration-200 hover:underline"
        @click="handleClick(item.steps)"
      >
        {{ item.name }}
      </button>
      <span v-else class="text-gray-900 font-medium">
        {{ item.name }}
      </span>

      <span v-if="index < items.length - 1" class="text-gray-400">
        {{ separator }}
      </span>
    </template>
  </nav>
</template>
