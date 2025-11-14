<script setup lang="ts">
import { useRouter } from 'vue-router'
import HomeLayout from '~/components/HomeLayout.vue'

const router = useRouter()

// 菜单项配置
const menuItems = [
  {
    name: '成员管理',
    icon: '👥',
    path: '/members', // 可以根据实际路由调整
  },
  {
    name: '群组管理',
    icon: '👨‍👩‍👧‍👦',
    path: '/groups', // 可以根据实际路由调整
  },
  {
    name: '部门管理',
    icon: '🏢',
    path: '/departments', // 可以根据实际路由调整
  },
]

// 处理菜单点击
function handleMenuClick(path: string) {
  router.push(path)
}
</script>

<template>
  <HomeLayout>
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">
          工作台
        </h1>

        <!-- 两列菜单网格 -->
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="item in menuItems"
            :key="item.path"
            class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center justify-center space-y-3 min-h-[120px]"
            @click="handleMenuClick(item.path)"
          >
            <span class="text-4xl">{{ item.icon }}</span>
            <span class="text-lg font-medium text-gray-900">{{ item.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>
