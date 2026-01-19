<script setup lang="ts">
import type { VipInfo } from '~/types/org'

defineProps<{
  vip: VipInfo
}>()

const { t } = useI18n()

// 格式化时间戳为日期字符串
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

// 格式化 VIP 支持功能名称
function formatSupportName(name: string): string {
  const nameMap: Record<string, string> = {
    member: t('vip.features.member'),
    dept: t('vip.features.dept'),
    group: t('vip.features.group'),
    device: t('vip.features.device'),
  }
  return nameMap[name] || name
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
    <!-- 头部区域 -->
    <div class="bg-gray-50 px-6 py-5 border-b border-gray-100">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">
        {{ t('vip.title') }}
      </h2>
      <div class="flex items-center space-x-4 mt-4">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-900">
            {{ vip.vip_name }}
          </h3>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="px-6 py-5">
      <!-- 时间信息 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="flex items-center mb-2">
            <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xs font-medium text-gray-600">{{ t('vip.createTime') }}</span>
          </div>
          <p class="text-sm text-gray-900 font-medium pl-6">
            {{ formatDate(vip.vip_created) }}
          </p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="flex items-center mb-2">
            <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xs font-medium text-gray-600">{{ t('vip.expireTime') }}</span>
          </div>
          <p class="text-sm text-gray-900 font-medium pl-6">
            {{ formatDate(vip.vip_expired) }}
          </p>
        </div>
      </div>

      <!-- 支持的功能 -->
      <div v-if="vip.vip_supports && vip.vip_supports.length > 0">
        <div class="flex items-center mb-4">
          <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 class="text-lg font-bold text-gray-900">
            {{ t('vip.features.title') }}
          </h4>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="support in vip.vip_supports.filter(s => s.name !== 'track')"
            :key="`${support.name}-${support.type}`"
            class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
          >
            <div class="mb-2">
              <span class="text-sm font-medium text-gray-900">{{ formatSupportName(support.name) }}</span>
            </div>
            <div v-if="support.support" class="text-xs text-gray-600 space-y-1">
              <div v-if="support.member_limit" class="flex items-center">
                <span class="text-gray-500 mr-2">{{ t('vip.limits.maxMembers') }}：</span>
                <span class="font-medium text-gray-700">{{ support.member_limit }}</span>
              </div>
              <div v-if="support.dept_limit" class="flex items-center">
                <span class="text-gray-500 mr-2">{{ t('vip.limits.maxDepartments') }}：</span>
                <span class="font-medium text-gray-700">{{ support.dept_limit }}</span>
              </div>
              <div v-if="support.dept_member_limit" class="flex items-center">
                <span class="text-gray-500 mr-2">{{ t('vip.limits.maxDeptMembers') }}：</span>
                <span class="font-medium text-gray-700">{{ support.dept_member_limit }}</span>
              </div>
              <div v-if="support.group_limit" class="flex items-center">
                <span class="text-gray-500 mr-2">{{ t('vip.limits.maxGroups') }}：</span>
                <span class="font-medium text-gray-700">{{ support.group_limit }}</span>
              </div>
              <div v-if="support.group_member_limit" class="flex items-center">
                <span class="text-gray-500 mr-2">{{ t('vip.limits.maxGroupMembers') }}：</span>
                <span class="font-medium text-gray-700">{{ support.group_member_limit }}</span>
              </div>
              <div v-if="support.device_limit" class="flex items-center">
                <span class="text-gray-500 mr-2">{{ t('vip.limits.maxDevices') }}：</span>
                <span class="font-medium text-gray-700">{{ support.device_limit }}</span>
              </div>
            </div>
            <div v-else class="text-xs text-gray-400">
              {{ t('vip.features.notEnabled') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
