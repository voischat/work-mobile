<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core'
import { useRouter } from 'vue-router'

interface BreadcrumbItem {
  name: string // 显示名称
  steps?: number // 回退步数，router.go(-steps)
}

const props = withDefaults(defineProps<{
  items: BreadcrumbItem[]
  separator?: string
}>(), {
  separator: '/',
})

const breakpoints = useBreakpoints({
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
})

const filterdItems = computed(() =>
  props.items.filter(({ name }) => !(name === '通讯录' && breakpoints.smaller('lg').value)),
)

const router = useRouter()

function handleClick(steps: number) {
  router.go(-steps)
}
</script>

<template>
  <nav class="flex items-center space-x-2 text-sm text-gray-600">
    <template
      v-for="(item, index) in filterdItems " :key="index"
    >
      <span
        v-if="item.steps !== undefined"
        class="hover:text-blue-600 transition-colors duration-200 hover:underline"
        @click="handleClick(item.steps)"
      >
        {{ item.name }}
      </span>
      <span v-else class="text-gray-900 font-medium">
        {{ item.name }}
      </span>

      <span v-if="index < filterdItems.length - 1" class="text-gray-400">
        {{ separator }}
      </span>
    </template>
  </nav>
</template>
