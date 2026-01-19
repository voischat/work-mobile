<script setup lang="ts">
import type { OrgInfo } from '~/types/org'
import { Icon } from '@iconify/vue'
import { useQuery } from '@pinia/colada'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from '~/components/Avatar.vue'
import { weilaFetch } from '~/shared/instances'

defineProps<{
  org: OrgInfo
}>()

const router = useRouter()
const { t } = useI18n()

// 认证信息接口响应类型
interface LegalInfo {
  id: number
  category: number
  type: number
  merchant: {
    business_license: string
  }
  state: 0 | 8 | 9 // 0 ~ 7 待审核 8 成功 9 失败
}

// 获取认证信息
const {
  data: legalInfo,
  error: legalError,
} = useQuery({
  key: ['legal', 'info'],
  query: () => weilaFetch<LegalInfo>('corp/legal/get-legal', { method: 'POST' }),
})

// 认证状态映射
const authStatusMap = {
  0: { label: t('organization.authStatus.pending'), color: 'bg-yellow-100 text-yellow-700' },
  1: { label: t('organization.authStatus.pending'), color: 'bg-yellow-100 text-yellow-700' },
  2: { label: t('organization.authStatus.pending'), color: 'bg-yellow-100 text-yellow-700' },
  3: { label: t('organization.authStatus.pending'), color: 'bg-yellow-100 text-yellow-700' },
  4: { label: t('organization.authStatus.pending'), color: 'bg-yellow-100 text-yellow-700' },
  5: { label: t('organization.authStatus.pending'), color: 'bg-yellow-100 text-yellow-700' },
  6: { label: t('organization.authStatus.pending'), color: 'bg-yellow-100 text-yellow-700' },
  7: { label: t('organization.authStatus.pending'), color: 'bg-yellow-100 text-yellow-700' },
  8: { label: t('organization.authStatus.verified'), color: 'bg-green-100 text-green-700' },
  9: { label: t('organization.authStatus.failed'), color: 'bg-red-100 text-red-700' },
} as const

// 计算认证状态
const authStatus = computed(() => {
  if (!legalInfo.value || legalError.value) {
    return null
  }
  const state = legalInfo.value.state
  return authStatusMap[state as keyof typeof authStatusMap] || { label: t('organization.authStatus.unknown'), color: 'bg-gray-100 text-gray-700' }
})

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

function navigateToCorpLegal() {
  router.push('/me/corp-legal')
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
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center space-x-2">
              <h2 class="text-2xl font-bold text-gray-900">
                {{ org.name }}
              </h2>
            </div>
            <!-- 认证按钮 -->
            <button
              type="button"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1.5"
              @click="navigateToCorpLegal"
            >
              <Icon icon="lucide:shield-check" class="w-4 h-4" />
              <span class="hidden md:inline">{{ t('organization.verified') }}</span>
            </button>
          </div>
          <p class="text-sm text-gray-600 flex items-center mb-1">
            <span
              v-if="authStatus"
              class="px-2 py-1 rounded text-xs font-medium"
              :class="authStatus.color"
            >
              {{ authStatus.label }}
            </span>
          </p>
          <p class="text-sm text-gray-600 flex items-center">
            <Icon icon="lucide:hash" class="w-4 h-4 mr-1.5 text-gray-400" />
            {{ t('organization.orgId') }}: <span class="font-medium text-gray-700 ml-1">{{ org.num }}</span>
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
            {{ t('organization.stats.members') }}
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
            {{ t('organization.stats.departments') }}
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
            {{ t('organization.stats.groups') }}
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
            {{ t('organization.stats.devices') }}
          </div>
        </div>
      </div>

      <!-- 简介 -->
      <div v-if="org.intro" class="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div class="flex items-center mb-2">
          <Icon icon="lucide:info" class="w-4 h-4 mr-2 text-gray-500" />
          <span class="text-sm font-medium text-gray-700">{{ t('organization.description') }}</span>
        </div>
        <p class="text-sm text-gray-700 leading-relaxed pl-6">
          {{ org.intro || t('organization.descriptionEmpty') }}
        </p>
      </div>

      <!-- 创建时间 -->
      <div class="flex items-center justify-end pt-4 border-t border-gray-100">
        <div class="flex items-center text-xs text-gray-500">
          <Icon icon="lucide:clock" class="w-4 h-4 mr-1.5" />
          <span>{{ t('organization.createdAt') }} {{ formatDate(org.created) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
