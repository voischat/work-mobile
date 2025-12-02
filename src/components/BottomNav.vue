<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { isActiveRoute } from '~/utils/router'

const router = useRouter()

// 导航项配置
const navItems = [
  {
    name: '首页',
    path: '/',
    icon: 'lucide:home',
  },
  {
    name: '通讯录',
    path: '/directory',
    icon: 'lucide:book',
  },
  // {
  //   name: '工作台',
  //   path: '/workbench',
  //   icon: 'lucide:briefcase',
  // },
  {
    name: '我的',
    path: '/me',
    icon: 'lucide:user',
  },
]

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
          'opacity-45': !isActiveRoute(item.path),
        }"
        @click="handleNavClick(item.path)"
      >
        <div class="mb-1 transition-transform duration-200">
          <Icon :icon="item.icon" class="w-6 h-6" />
        </div>
        <span class="text-xs font-medium">{{ item.name }}</span>
        <div
          v-if="isActiveRoute(item.path)"
          class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gray-900 rounded-full"
        />
      </button>
    </div>
  </nav>
</template>
