<script setup lang="ts">
interface BreadcrumbItem {
  name: string
  route?: string
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
  props.items.filter(({ name }) => !(name === '通讯录' && breakpoints.greater('lg').value)),
)

const router = useRouter()

function handleClick(route: string) {
  router.replace(route)
}

const isDev = import.meta.env.DEV
const route = useRoute()
</script>

<template>
  <div v-if="isDev" class="text-neutral-400 text-xs">
    {{ route.fullPath }}
  </div>
  <nav class="flex items-center space-x-2 text-sm text-gray-600">
    <template
      v-for="(item, index) in filterdItems " :key="index"
    >
      <span
        v-if="item.route"
        class="hover:text-blue-600 transition-colors duration-200 hover:underline"
        @click="handleClick(item.route)"
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
