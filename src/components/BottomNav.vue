<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 导航项配置
const navItems = [
  {
    name: '首页',
    path: '/',
    icon: '🏠',
  },
  {
    name: '我的',
    path: '/me',
    icon: '👤',
  },
]

// 判断当前路由是否激活
function isActive(path: string) {
  return route.path === path
}

// 处理导航点击
function handleNavClick(path: string) {
  router.push(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
    <div class="flex items-center justify-around h-16">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors" :class="[
          isActive(item.path)
            ? 'text-blue-600'
            : 'text-gray-500 hover:text-gray-700',
        ]"
        @click="handleNavClick(item.path)"
      >
        <span class="text-2xl mb-1">{{ item.icon }}</span>
        <span class="text-xs font-medium">{{ item.name }}</span>
      </button>
    </div>
  </nav>
</template>
