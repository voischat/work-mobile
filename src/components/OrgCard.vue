<script setup lang="ts">
import type { OrgInfo } from '~/types/org'
import { useRouter } from 'vue-router'
import Avatar from '~/components/Avatar.vue'

defineProps<{
  org: OrgInfo
}>()

const router = useRouter()

// 格式化时间戳为日期字符串
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

// 导航函数
function navigateToMembers() {
  router.push('/directory/members/')
}

function navigateToDepartments() {
  router.push('/directory/departments')
}

function navigateToGroups() {
  router.push('/directory/groups')
}

function navigateToDevices() {
  // 由于没有专门的设备页面，导航到成员页面（设备通常在成员管理中查看）
  router.push('/directory/members')
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
    <!-- 头部区域 -->
    <div class="bg-gray-50 px-6 py-5 border-b border-gray-100">
      <div class="flex items-center space-x-4">
        <div class="relative flex-shrink-0">
          <div class="absolute inset-0 bg-white rounded-full shadow-lg transform scale-110 -z-0" />
          <div class="relative z-10">
            <Avatar
              :src="org.avatar"
              :alt="org.name"
              size="xl"
              shape="circle"
            />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold text-gray-900 mb-1">
            {{ org.name }}
          </h2>
          <p class="text-sm text-gray-600 flex items-center">
            <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            企业号: <span class="font-medium text-gray-700 ml-1">{{ org.num }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- 统计信息卡片 -->
    <div class="px-6 py-5">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <!-- 成员数 -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors duration-200 text-center cursor-pointer" @click="navigateToMembers">
          <div class="flex items-center justify-center mb-3">
            <div class="p-3 rounded-lg">
              <svg class="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div class="text-2xl font-bold text-gray-900 mb-1">
            {{ org.member_cnt }}
          </div>
          <div class="text-xs font-medium text-gray-600">
            成员数
          </div>
        </div>

        <!-- 部门数 -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors duration-200 text-center cursor-pointer" @click="navigateToDepartments">
          <div class="flex items-center justify-center mb-3">
            <div class="p-3 rounded-lg">
              <svg class="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div class="text-2xl font-bold text-gray-900 mb-1">
            {{ org.dept_cnt }}
          </div>
          <div class="text-xs font-medium text-gray-600">
            部门数
          </div>
        </div>

        <!-- 群组数 -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors duration-200 text-center cursor-pointer" @click="navigateToGroups">
          <div class="flex items-center justify-center mb-3">
            <div class="p-3 rounded-lg">
              <svg class="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="text-2xl font-bold text-gray-900 mb-1">
            {{ org.group_cnt }}
          </div>
          <div class="text-xs font-medium text-gray-600">
            群组数
          </div>
        </div>

        <!-- 设备数 -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors duration-200 text-center cursor-pointer" @click="navigateToDevices">
          <div class="flex items-center justify-center mb-3">
            <div class="p-3 rounded-lg">
              <svg class="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="text-2xl font-bold text-gray-900 mb-1">
            {{ org.device_cnt }}
          </div>
          <div class="text-xs font-medium text-gray-600">
            设备数
          </div>
        </div>
      </div>

      <!-- 简介 -->
      <div v-if="org.intro" class="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div class="flex items-center mb-2">
          <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium text-gray-700">简介</span>
        </div>
        <p class="text-sm text-gray-700 leading-relaxed pl-6">
          {{ org.intro || '暂无简介' }}
        </p>
      </div>

      <!-- 创建时间 -->
      <div class="flex items-center justify-end pt-4 border-t border-gray-100">
        <div class="flex items-center text-xs text-gray-500">
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>创建于 {{ formatDate(org.created) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
