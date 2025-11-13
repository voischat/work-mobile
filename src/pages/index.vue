<script setup lang="ts">
import type { OrgInfo, VipInfo } from '~/types/org'
import { computed } from 'vue'
import HomeLayout from '~/components/HomeLayout.vue'
import OrgCard from '~/components/OrgCard.vue'
import VipCard from '~/components/VipCard.vue'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 获取组织信息（pickWeilaData 会自动提取 org 字段）
const {
  data: org,
  error: orgError,
  isFetching: isOrgFetching,
} = useWeilaFetch<OrgInfo>('/corp/org/get-my-org').post().json()

// 获取 VIP 信息（pickWeilaData 会自动提取 vip 字段）
const {
  data: vip,
  error: vipError,
  isFetching: isVipFetching,
} = useWeilaFetch<VipInfo>('/corp/org/get-my-vip').post().json()

// 计算属性
const isLoading = computed(() => isOrgFetching.value || isVipFetching.value)
const hasError = computed(() => !!orgError.value || !!vipError.value)
</script>

<template>
  <HomeLayout>
    <div class="p-4">
      <div class="max-w-4xl mx-auto space-y-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">
          组织信息
        </h1>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <div class="text-gray-600">
            加载中...
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">
            <p v-if="orgError" class="mb-2">
              获取组织信息失败: {{ orgError.message }}
            </p>
            <p v-if="vipError">
              获取 VIP 信息失败: {{ vipError.message }}
            </p>
          </div>
        </div>

        <!-- 内容展示 -->
        <div v-else class="space-y-6">
          <!-- 组织信息卡片 -->
          <OrgCard v-if="org" :org="org" />

          <!-- VIP 信息卡片 -->
          <VipCard v-if="vip" :vip="vip" />

          <!-- 无数据提示 -->
          <div v-if="!org && !vip" class="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            暂无数据
          </div>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>
