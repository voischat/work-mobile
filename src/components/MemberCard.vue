<script setup lang="ts">
import type { Member } from '~/types/management'
import { Icon } from '@iconify/vue'
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from 'reka-ui'
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'

defineProps<{
  member: Member
  deptName?: string
}>()

const memberTypeMap = {
  0: { label: '成员' },
  1: { label: '设备' },
  2: { label: '管理员' },
  255: { label: '企业主' },
} as const

const onlineStatusMap = {
  0: { label: '离线', icon: 'lucide:circle' },
  1: { label: '在线', icon: 'lucide:circle' },
} as const

const sexMap = {
  1: { icon: 'ph:gender-female-duotone', color: 'text-gray-500' },
  2: { icon: 'ph:gender-male-duotone', color: 'text-gray-500' },
} as const

const trackTypeMap = {
  0: { label: '关闭', speed: '' },
  1: { label: '1 小时', speed: '慢' },
  2: { label: '15 分钟', speed: '中' },
  3: { label: '5 分钟', speed: '快' },
  4: { label: '1 分钟', speed: '极快' },
} as const

const locShareMap = {
  0: { label: '关闭' },
  1: { label: '开启' },
} as const

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('zh-CN')
}
</script>

<template>
  <CollapsibleRoot class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
    <!-- Header Section -->
    <div class="p-5">
      <div class="flex items-start space-x-3.5">
        <!-- Avatar using Reka UI -->
        <AvatarRoot class="inline-flex h-14 w-14 shrink-0 select-none items-center justify-center overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200/50">
          <AvatarImage
            class="h-full w-full object-cover"
            :src="member.avatar"
            :alt="member.name"
          />
          <AvatarFallback class="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-600">
            {{ member.name?.slice(0, 2) || 'UN' }}
          </AvatarFallback>
        </AvatarRoot>

        <!-- Basic Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-2">
            <h3 class="text-base font-semibold text-gray-900 tracking-tight">
              {{ member.name || '未命名' }}
            </h3>
            <Icon
              v-if="member.sex && sexMap[member.sex as keyof typeof sexMap]"
              :icon="sexMap[member.sex as keyof typeof sexMap].icon"
              class="w-4 h-4"
              :class="sexMap[member.sex as keyof typeof sexMap].color"
            />
          </div>

          <div class="flex items-center flex-wrap space-x-2">
            <!-- Member Type Badge -->
            <span
              v-if="memberTypeMap[member.type as keyof typeof memberTypeMap]"
              class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
            >
              {{ memberTypeMap[member.type as keyof typeof memberTypeMap].label }}
            </span>

            <!-- Online Status -->
            <span
              v-if="member.online_status !== undefined"
              class="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-xs font-medium border"
              :class="member.online_status === 1
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'"
            >
              <Icon
                :icon="onlineStatusMap[member.online_status as keyof typeof onlineStatusMap]?.icon || 'lucide:circle'"
                class="w-2 h-2"
                :class="member.online_status === 1 ? 'text-green-600 fill-current' : 'text-gray-400'"
              />
              <span>{{ onlineStatusMap[member.online_status as keyof typeof onlineStatusMap]?.label || '未知' }}</span>
            </span>

            <!-- Department -->
            <span v-if="deptName" class="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              <Icon icon="lucide:building-2" class="w-3 h-3" />
              <span>{{ deptName }}</span>
            </span>
          </div>
        </div>

        <!-- Expand/Collapse Trigger -->
        <CollapsibleTrigger class="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
          <Icon
            icon="lucide:chevron-down"
            class="size-5 transition-transform duration-200 collapsible-chevron"
          />
        </CollapsibleTrigger>
      </div>
    </div>

    <!-- Collapsible Content -->
    <CollapsibleContent class="collapsible-content">
      <div class="px-5 pb-5 space-y-4 border-t border-gray-100">
        <!-- Details Table -->
        <div class="space-y-2.5 text-sm pt-4">
          <div v-if="member.job_num" class="flex items-center">
            <span class="w-20 text-gray-500 font-medium">工号</span>
            <span class="text-gray-900 font-medium">{{ member.job_num }}</span>
          </div>
          <div v-if="member.phone" class="flex items-center">
            <span class="w-20 text-gray-500 font-medium">手机号</span>
            <span class="text-gray-900">{{ member.phone }}</span>
          </div>
          <div class="flex items-center">
            <span class="w-20 text-gray-500 font-medium">微喇号</span>
            <span class="text-gray-900">{{ member.user_num }}</span>
          </div>
          <div v-if="member.grp_cnt !== undefined && member.grp_lmt !== undefined" class="flex items-center">
            <span class="w-20 text-gray-500 font-medium">群组</span>
            <span
              :class="member.grp_cnt >= member.grp_lmt
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'text-gray-900'"
            >
              {{ member.grp_cnt }} / {{ member.grp_lmt }}
            </span>
          </div>
          <div class="flex items-center">
            <span class="w-20 text-gray-500 font-medium">创建时间</span>
            <span class="text-gray-600">{{ formatDate(member.created) }}</span>
          </div>
        </div>

        <!-- Feature Status -->
        <div class="flex items-center flex-wrap space-x-2 pt-3 border-t border-gray-100">
          <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <Icon icon="lucide:route" class="w-3.5 h-3.5" />
            <span>轨迹: {{ trackTypeMap[member.track as keyof typeof trackTypeMap]?.label || '未知' }}</span>
          </span>
          <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <Icon icon="lucide:map-pin" class="w-3.5 h-3.5" />
            <span>位置共享: {{ locShareMap[member.loc_share as keyof typeof locShareMap]?.label || '未知' }}</span>
          </span>
        </div>

        <!-- Actions Slot -->
        <div class="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
          <slot name="actions" />
        </div>
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
.collapsible-content {
  overflow: hidden;
}

.collapsible-content[data-state='open'] {
  animation: slideDown 300ms ease-out;
}

.collapsible-content[data-state='closed'] {
  animation: slideUp 300ms ease-out;
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--reka-collapsible-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--reka-collapsible-content-height);
  }
  to {
    height: 0;
  }
}

.collapsible-chevron {
  transition: transform 200ms ease;
}

button[data-state='open'] .collapsible-chevron {
  transform: rotate(180deg);
}
</style>
