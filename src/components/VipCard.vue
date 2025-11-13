<script setup lang="ts">
import type { VipInfo } from '~/types/org'

defineProps<{
  vip: VipInfo
}>()

// 格式化时间戳为日期字符串
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

// 格式化 VIP 支持功能名称
function formatSupportName(name: string): string {
  const nameMap: Record<string, string> = {
    member: '成员',
    dept: '部门',
    group: '群组',
    device: '设备',
    track: '轨迹',
  }
  return nameMap[name] || name
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold text-gray-900 mb-4">
      VIP 信息
    </h2>
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-4 border-b">
        <div>
          <h3 class="text-xl font-medium text-gray-900">
            {{ vip.vip_name }}
          </h3>
          <p class="text-sm text-gray-500">
            VIP 等级: {{ vip.vip }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-600">
            创建时间
          </p>
          <p class="text-sm text-gray-900">
            {{ formatDate(vip.vip_created) }}
          </p>
        </div>
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-2">
          过期时间
        </p>
        <p class="text-lg font-medium text-gray-900">
          {{ formatDate(vip.vip_expired) }}
        </p>
      </div>
      <div v-if="vip.vip_supports && vip.vip_supports.length > 0">
        <h4 class="text-lg font-medium text-gray-900 mb-3">
          支持的功能
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="support in vip.vip_supports"
            :key="`${support.name}-${support.type}`"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-2">
              <span
                class="w-2 h-2 rounded-full"
                :class="support.support ? 'bg-green-500' : 'bg-gray-300'"
              />
              <div class="flex flex-col">
                <span class="text-gray-900 font-medium">{{ formatSupportName(support.name) }}</span>
              </div>
            </div>
            <div v-if="support.support" class="text-sm text-gray-600 text-right">
              <div v-if="support.member_limit" class="mb-1">
                成员上限：{{ support.member_limit }}
              </div>
              <div v-if="support.dept_limit" class="mb-1">
                部门上限：{{ support.dept_limit }}
              </div>
              <div v-if="support.dept_member_limit" class="mb-1">
                部门成员上限：{{ support.dept_member_limit }}
              </div>
              <div v-if="support.group_limit" class="mb-1">
                群组上限：{{ support.group_limit }}
              </div>
              <div v-if="support.group_member_limit" class="mb-1">
                群组成员上限：{{ support.group_member_limit }}
              </div>
              <div v-if="support.device_limit" class="mb-1">
                设备上限：{{ support.device_limit }}
              </div>
              <div v-if="support.quick_support" class="text-green-600 font-medium mt-2">
                快速定位
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
