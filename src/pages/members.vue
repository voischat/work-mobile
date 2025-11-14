<script setup lang="ts">
import type { Dept, MemberListResponse } from '~/types/management'
import BackLayout from '~/components/BackLayout.vue'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 获取成员列表
const {
  data: memberListData,
  error: memberError,
  isFetching: isMemberFetching,
} = useWeilaFetch<MemberListResponse>('/corp/address/get-member-list?page=0&size=10')
  .post(() => ({
    key: '',
  }))
  .json()

// 获取部门列表（用于显示部门名称）
const {
  data: depts,
} = useWeilaFetch<Dept[]>('/corp/address/get-all-dept')
  .post()
  .json()

// 成员类型映射
const memberTypeMap = {
  1: { label: '设备', color: 'bg-gray-100 text-gray-700' },
  2: { label: '管理员', color: 'bg-blue-100 text-blue-700' },
  255: { label: '企业主', color: 'bg-purple-100 text-purple-700' },
} as const

// 状态映射（state: 0=启用, 1=暂停）
const stateMap = {
  0: { label: '启用', color: 'bg-green-100 text-green-700' },
  1: { label: '暂停', color: 'bg-gray-100 text-gray-700' },
} as const

// 在线状态映射
const onlineStatusMap = {
  0: { label: '离线', color: 'bg-gray-100 text-gray-700' },
  1: { label: '在线', color: 'bg-green-100 text-green-700' },
} as const

// 追踪类型映射（根据参考代码，track 值对应：关闭/高/中/低/快）
const trackTypeMap = {
  0: { label: '关闭', color: 'bg-gray-100 text-gray-700' },
  1: { label: '高', color: 'bg-red-100 text-red-700' },
  2: { label: '中', color: 'bg-orange-100 text-orange-700' },
  3: { label: '低', color: 'bg-yellow-100 text-yellow-700' },
  4: { label: '快', color: 'bg-blue-100 text-blue-700' },
} as const

// 位置分享映射
const locShareMap = {
  0: { label: '关闭', color: 'bg-gray-100 text-gray-700' },
  1: { label: '开启', color: 'bg-green-100 text-green-700' },
} as const

// 根据部门ID获取部门名称
function getDeptName(deptId: number): string {
  return depts.value?.find((d: Dept) => d.id === deptId)?.name || ''
}

// 格式化日期
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('zh-CN')
}
</script>

<template>
  <BackLayout title="成员管理">
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- 加载状态 -->
        <div v-if="isMemberFetching" class="flex items-center justify-center py-12">
          <div class="text-gray-600">
            加载中...
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="memberError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">
            <p>获取成员列表失败: {{ memberError.message }}</p>
          </div>
        </div>

        <!-- 成员列表 -->
        <div v-else-if="memberListData?.members?.length" class="space-y-4">
          <div
            v-for="member in memberListData.members"
            :key="member.user_id"
            class="bg-white rounded-lg p-4 border border-gray-200"
          >
            <!-- 顶部：头像、姓名、类型、状态 -->
            <div class="flex items-start space-x-3 mb-4">
              <!-- 头像 -->
              <img
                :src="member.avatar"
                :alt="member.name"
                class="w-12 h-12 rounded object-cover flex-shrink-0"
              >
              <!-- 基本信息 -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  {{ member.name || '未命名' }}
                </h3>
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

            <!-- 中间：详细信息表格 -->
            <div class="mb-4">
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
                  <tr v-if="getDeptName(member.dept_id)" class="hover:bg-gray-50">
                    <td class="py-2 pr-4 text-gray-500 w-20">
                      部门
                    </td>
                    <td class="py-2 text-gray-900">
                      {{ getDeptName(member.dept_id) }}
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

            <!-- 底部：功能状态 -->
            <div class="flex items-center flex-wrap space-x-2 mb-4 pb-4 border-b border-gray-200">
              <span
                class="px-2 py-0.5 rounded text-xs font-medium" :class="[trackTypeMap[member.track as keyof typeof trackTypeMap]?.color || 'bg-gray-100 text-gray-700']"
              >
                追踪: {{ trackTypeMap[member.track as keyof typeof trackTypeMap]?.label || '未知' }}
              </span>
              <span
                class="px-2 py-0.5 rounded text-xs font-medium" :class="[locShareMap[member.loc_share as keyof typeof locShareMap]?.color || 'bg-gray-100 text-gray-700']"
              >
                位置分享: {{ locShareMap[member.loc_share as keyof typeof locShareMap]?.label || '未知' }}
              </span>
            </div>

            <!-- 底部操作区域 -->
            <div class="flex items-center justify-end space-x-3 pt-2">
              <button class="px-3 py-1.5 text-sm text-blue-600 bg-white border-0">
                编辑
              </button>
              <button class="px-3 py-1.5 text-sm text-red-600 bg-white border-0">
                删除
              </button>
            </div>
          </div>
        </div>

        <!-- 空数据状态 -->
        <div v-else class="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          暂无成员数据
        </div>
      </div>
    </div>
  </BackLayout>
</template>
