<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 导航项配置
const navItems = [
  {
    name: '首页',
    path: '/',
    icon: 'home',
  },
  {
    name: '工作台',
    path: '/home',
    icon: 'briefcase',
  },
  {
    name: '我的',
    path: '/me',
    icon: 'user',
  },
]

// 判断当前路由是否激活
function isActive(path: string) {
  // 对于根路径，需要精确匹配
  if (path === '/') {
    return route.path === path
  }
  // 对于其他路径，检查是否以该路径开头
  return route.path.startsWith(path)
}

// 处理导航点击
function handleNavClick(path: string) {
  router.replace(path)
}
</script>

<template>
  <nav class="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm z-50">
    <div class="flex items-center justify-around h-16">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-200"
        :class="{
          'opacity-45': !isActive(item.path),
        }"
        @click="handleNavClick(item.path)"
      >
        <div class="mb-1 transition-transform duration-200">
          <!-- 首页图标 -->
          <svg
            v-if="item.icon === 'home'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <!-- 工作台图标 -->
          <svg
            v-else-if="item.icon === 'briefcase'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <!-- 我的图标 -->
          <svg
            v-else-if="item.icon === 'user'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <span class="text-xs font-medium">{{ item.name }}</span>
        <div
          v-if="isActive(item.path)"
          class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gray-900 rounded-full"
        />
      </button>
    </div>
  </nav>
</template>
