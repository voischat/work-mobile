<script setup lang="ts">
import type { OrgInfo } from '~/types/org'
import { Icon } from '@iconify/vue'
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
          <div class="absolute left-0 right-0 top-0 bottom-0 bg-white rounded-full shadow-lg transform scale-110 -z-0" />
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
            <Icon icon="lucide:hash" class="w-4 h-4 mr-1.5 text-gray-400" />
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
              <Icon icon="lucide:users" class="w-7 h-7 text-gray-600" />
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
              <Icon icon="lucide:building" class="w-7 h-7 text-gray-600" />
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
              <Icon icon="lucide:users-round" class="w-7 h-7 text-gray-600" />
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
              <Icon icon="lucide:monitor" class="w-7 h-7 text-gray-600" />
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
          <Icon icon="lucide:info" class="w-4 h-4 mr-2 text-gray-500" />
          <span class="text-sm font-medium text-gray-700">简介</span>
        </div>
        <p class="text-sm text-gray-700 leading-relaxed pl-6">
          {{ org.intro || '暂无简介' }}
        </p>
      </div>

      <!-- 创建时间 -->
      <div class="flex items-center justify-end pt-4 border-t border-gray-100">
        <div class="flex items-center text-xs text-gray-500">
          <Icon icon="lucide:clock" class="w-4 h-4 mr-1.5" />
          <span>创建于 {{ formatDate(org.created) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
