<script setup lang="ts">
import type { OrgInfo } from '~/types/org'

defineProps<{
  org: OrgInfo
}>()

// 格式化时间戳为日期字符串
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold text-gray-900 mb-4">
      组织信息
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex items-center space-x-4">
        <img
          v-if="org.avatar"
          :src="org.avatar"
          :alt="org.name"
          class="w-16 h-16 rounded-full object-cover"
        >
        <div>
          <h3 class="text-xl font-medium text-gray-900">
            {{ org.name }}
          </h3>
          <p class="text-sm text-gray-500">
            组织编号: {{ org.num }}
          </p>
        </div>
      </div>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">成员数:</span>
          <span class="font-medium text-gray-900">{{ org.member_cnt }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">部门数:</span>
          <span class="font-medium text-gray-900">{{ org.dept_cnt }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">群组数:</span>
          <span class="font-medium text-gray-900">{{ org.group_cnt }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">设备数:</span>
          <span class="font-medium text-gray-900">{{ org.device_cnt }}</span>
        </div>
      </div>
      <div v-if="org.intro" class="md:col-span-2">
        <span class="text-gray-600">简介:</span>
        <p class="text-gray-900 mt-1">
          {{ org.intro || '暂无简介' }}
        </p>
      </div>
      <div class="md:col-span-2 text-sm text-gray-500">
        创建时间: {{ formatDate(org.created) }}
      </div>
    </div>
  </div>
</template>
