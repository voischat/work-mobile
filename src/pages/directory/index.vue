<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import HomeLayout from '~/components/HomeLayout.vue'

const router = useRouter()

// 处理菜单点击
function handleMenuClick(path: string) {
  router.push(path)
}
</script>

<template>
  <HomeLayout>
    <div class="p-4">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- 两列菜单网格 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 成员管理 -->
          <button
            class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center space-y-3 min-h-[140px] p-6"
            @click="handleMenuClick('/directory/members')"
          >
            <div class="p-3 rounded-lg">
              <Icon icon="lucide:users" class="w-12 h-12 text-gray-600" />
            </div>
            <span class="text-lg font-bold text-gray-900">成员管理</span>
          </button>

          <!-- 群组管理 -->
          <button
            class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center space-y-3 min-h-[140px] p-6"
            @click="handleMenuClick('/directory/groups')"
          >
            <div class="p-3 rounded-lg">
              <Icon icon="lucide:users-round" class="w-12 h-12 text-gray-600" />
            </div>
            <span class="text-lg font-bold text-gray-900">群组管理</span>
          </button>

          <!-- 部门管理 -->
          <button
            class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center space-y-3 min-h-[140px] p-6"
            @click="handleMenuClick('/directory/departments')"
          >
            <div class="p-3 rounded-lg">
              <Icon icon="lucide:building" class="w-12 h-12 text-gray-600" />
            </div>
            <span class="text-lg font-bold text-gray-900">部门管理</span>
          </button>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>
