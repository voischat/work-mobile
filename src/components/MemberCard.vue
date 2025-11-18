<script setup lang="ts">
import type { Member } from '~/types/management'
import { ref, watch } from 'vue'

const props = defineProps<{
  member: Member
  deptName?: string
}>()

// 展开/收缩状态，默认收缩
const isExpanded = ref(false)

// 头像加载错误状态
const avatarError = ref(false)

// 处理头像加载错误
function handleAvatarError() {
  avatarError.value = true
}

// 当 member.avatar 变化时，重置头像错误状态
watch(() => props.member?.avatar, () => {
  avatarError.value = false
})

// 切换展开/收缩
function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

// 成员类型映射
const memberTypeMap = {
  1: { label: '设备', color: 'bg-gray-100 text-gray-700' },
  2: { label: '管理员', color: 'bg-blue-100 text-blue-700' },
  255: { label: '企业主', color: 'bg-purple-100 text-purple-700' },
} as const

// 状态映射（state: 0=启用, 1=停用）
const stateMap = {
  0: { label: '启用', color: 'bg-green-100 text-green-700' },
  1: { label: '停用', color: 'bg-gray-100 text-gray-700' },
} as const

// 在线状态映射
const onlineStatusMap = {
  0: { label: '离线', color: 'bg-gray-100 text-gray-700' },
  1: { label: '在线', color: 'bg-green-100 text-green-700' },
} as const

// 轨迹类型映射
const trackTypeMap = {
  0: { label: '关闭', color: 'bg-gray-100 text-gray-700' },
  1: { label: '高', color: 'bg-red-100 text-red-700' },
  2: { label: '中', color: 'bg-orange-100 text-orange-700' },
  3: { label: '低', color: 'bg-yellow-100 text-yellow-700' },
  4: { label: '快', color: 'bg-blue-100 text-blue-700' },
} as const

// 位置共享映射
const locShareMap = {
  0: { label: '关闭', color: 'bg-gray-100 text-gray-700' },
  1: { label: '开启', color: 'bg-green-100 text-green-700' },
} as const

// 格式化日期
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <!-- 顶部：头像、姓名、类型、状态 -->
    <div class="flex items-start space-x-3 mb-4">
      <!-- 头像 -->
      <img
        v-if="!avatarError"
        :src="member.avatar"
        :alt="member.name"
        class="size-14 rounded object-cover flex-shrink-0"
        @error="handleAvatarError"
      >
      <!-- 头像错误占位符 -->
      <div
        v-else
        class="size-14 rounded bg-gray-200 flex-shrink-0 flex items-center justify-center"
      >
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <!-- 基本信息 -->
      <div
        class="flex-1 min-w-0"
        @click="toggleExpand"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-medium text-gray-900">
            {{ member.name || '未命名' }}
          </h3>
          <!-- 展开/收缩按钮 -->
          <button
            type="button"
            class="flex-shrink-0 ml-2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <svg
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'rotate-180': isExpanded }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div class="flex items-center flex-wrap space-x-2">
          <!-- 成员类型标签 -->
          <span
            v-if="memberTypeMap[member.type as keyof typeof memberTypeMap]"
            class="px-2 py-0.5 rounded text-xs font-medium" :class="[memberTypeMap[member.type as keyof typeof memberTypeMap].color]"
          >
            {{ memberTypeMap[member.type as keyof typeof memberTypeMap].label }}
          </span>
          <!-- 在线状态 -->
          <span
            v-if="member.online_status !== undefined"
            class="px-2 py-0.5 rounded text-xs font-medium" :class="[onlineStatusMap[member.online_status as keyof typeof onlineStatusMap]?.color || 'bg-gray-100 text-gray-700']"
          >
            {{ onlineStatusMap[member.online_status as keyof typeof onlineStatusMap]?.label || '未知' }}
          </span>
          <!-- 成员状态 -->
          <span
            class="px-2 py-0.5 rounded text-xs font-medium" :class="[stateMap[member.state as keyof typeof stateMap]?.color || 'bg-gray-100 text-gray-700']"
          >
            {{ stateMap[member.state as keyof typeof stateMap]?.label || '未知' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 中间：详细信息表格（可展开/收缩） -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[1000px]"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 max-h-[1000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isExpanded" class="mb-4 overflow-hidden">
        <table class="w-full text-sm">
          <tbody class="divide-y divide-gray-100">
            <tr v-if="member.job_num" class="hover:bg-gray-50">
              <td class="py-2 pr-4 text-gray-500 w-20">
                工号
              </td>
              <td class="py-2 text-gray-900">
                {{ member.job_num }}
              </td>
            </tr>
            <tr v-if="member.phone" class="hover:bg-gray-50">
              <td class="py-2 pr-4 text-gray-500 w-20">
                手机
              </td>
              <td class="py-2 text-gray-900">
                {{ member.phone }}
              </td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="py-2 pr-4 text-gray-500 w-20">
                微喇号
              </td>
              <td class="py-2 text-gray-900">
                {{ member.user_num }}
              </td>
            </tr>
            <tr v-if="deptName" class="hover:bg-gray-50">
              <td class="py-2 pr-4 text-gray-500 w-20">
                部门
              </td>
              <td class="py-2 text-gray-900">
                {{ deptName }}
              </td>
            </tr>
            <tr v-if="member.grp_cnt !== undefined && member.grp_lmt !== undefined" class="hover:bg-gray-50">
              <td class="py-2 pr-4 text-gray-500 w-20">
                群组
              </td>
              <td class="py-2" :class="[member.grp_cnt >= member.grp_lmt ? 'text-red-600 font-medium' : 'text-gray-900']">
                {{ member.grp_cnt }} / {{ member.grp_lmt }}
              </td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="py-2 pr-4 text-gray-500 w-20">
                创建时间
              </td>
              <td class="py-2 text-gray-900">
                {{ formatDate(member.created) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Transition>

    <!-- 底部：功能状态（可展开/收缩） -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[200px]"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 max-h-[200px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isExpanded" class="flex items-center flex-wrap space-x-2 mb-4 pb-4 border-b border-gray-200 overflow-hidden">
        <span
          class="px-2 py-0.5 rounded text-xs font-medium" :class="[trackTypeMap[member.track as keyof typeof trackTypeMap]?.color || 'bg-gray-100 text-gray-700']"
        >
          轨迹: {{ trackTypeMap[member.track as keyof typeof trackTypeMap]?.label || '未知' }}
        </span>
        <span
          class="px-2 py-0.5 rounded text-xs font-medium" :class="[locShareMap[member.loc_share as keyof typeof locShareMap]?.color || 'bg-gray-100 text-gray-700']"
        >
          位置共享: {{ locShareMap[member.loc_share as keyof typeof locShareMap]?.label || '未知' }}
        </span>
      </div>
    </Transition>

    <!-- 底部操作区域插槽（可展开/收缩） -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[100px]"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 max-h-[100px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isExpanded" class="flex items-center justify-end space-x-3 pt-2 overflow-hidden">
        <slot name="actions" />
      </div>
    </Transition>
  </div>
</template>
