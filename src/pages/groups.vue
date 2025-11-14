<script setup lang="ts">
import type { GroupListResponse } from '~/types/management'
import BackLayout from '~/components/BackLayout.vue'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 获取群组列表
const {
  data: groupListData,
  error: groupError,
  isFetching: isGroupFetching,
} = useWeilaFetch<GroupListResponse>('/corp/group/get-my-manage-group-list?page=0&size=10')
  .post()
  .json()
</script>

<template>
  <BackLayout title="群组管理">
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- 加载状态 -->
        <div v-if="isGroupFetching" class="flex items-center justify-center py-12">
          <div class="text-gray-600">
            加载中...
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="groupError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">
            <p>获取群组列表失败: {{ groupError.message }}</p>
          </div>
        </div>

        <!-- 群组列表 -->
        <div v-else-if="groupListData?.groups?.length" class="space-y-4">
          <div
            v-for="group in groupListData.groups"
            :key="group.id"
            class="bg-white rounded-lg shadow-md p-4"
          >
            <div class="flex items-center space-x-4">
              <!-- 头像 -->
              <img
                :src="group.avatar"
                :alt="group.name"
                class="w-12 h-12 rounded-full object-cover flex-shrink-0"
              >
              <!-- 信息 -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-medium text-gray-900 mb-1 truncate">
                  {{ group.name }}
                </h3>
                <p class="text-sm text-gray-600">
                  成员数量: {{ group.user_count }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 空数据状态 -->
        <div v-else class="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          暂无群组数据
        </div>
      </div>
    </div>
  </BackLayout>
</template>
