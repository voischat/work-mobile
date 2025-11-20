<script setup lang="ts">
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
            @click="handleMenuClick('/members')"
          >
            <div class="p-3 rounded-lg">
              <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span class="text-lg font-bold text-gray-900">成员管理</span>
          </button>

          <!-- 群组管理 -->
          <button
            class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center space-y-3 min-h-[140px] p-6"
            @click="handleMenuClick('/groups')"
          >
            <div class="p-3 rounded-lg">
              <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span class="text-lg font-bold text-gray-900">群组管理</span>
          </button>

          <!-- 部门管理 -->
          <button
            class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center space-y-3 min-h-[140px] p-6"
            @click="handleMenuClick('/departments')"
          >
            <div class="p-3 rounded-lg">
              <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span class="text-lg font-bold text-gray-900">部门管理</span>
          </button>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>
