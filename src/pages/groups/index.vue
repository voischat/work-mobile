<script setup lang="ts">
import type { Group, GroupListResponse } from '~/types/management'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BackLayout from '~/components/BackLayout.vue'
import GroupActions from '~/components/GroupActions.vue'
import { usePage } from '~/composables/usePage'
import { useWeilaFetch } from '~/composables/useWeilaFetch'
import { isAtBottom } from '~/shared/states'

const router = useRouter()

// 分页状态
const { curPage, pageSize } = usePage()
const allGroups = ref<Group[]>([]) // 累积存储所有已加载的群组
const isLoadingMore = ref(false) // 是否正在加载更多

// 动态构建 API URL
const groupListUrl = computed(() => `/corp/group/get-my-manage-group-list?page=${curPage.value}&size=${pageSize}`)

// 获取群组列表
const {
  data: groupListData,
  error: groupError,
  isFetching: isGroupFetching,
  execute: refetchGroups,
} = useWeilaFetch<GroupListResponse>(groupListUrl)
  .post()
  .json()

// 监听数据加载完成，填充 allGroups
watch(groupListData, (newData) => {
  if (newData?.groups) {
    if (curPage.value === 0) {
      // 初始加载时，直接设置 allGroups
      allGroups.value = [...newData.groups]
    }
    else {
      // 加载更多时，追加到 allGroups
      allGroups.value.push(...newData.groups)
    }
  }
}, { immediate: true })

// 加载更多群组
async function loadMoreGroups() {
  // 防止重复加载
  if (isLoadingMore.value || isGroupFetching.value) {
    isAtBottom.value = false
    return
  }

  // 检查是否还有更多数据
  if (allGroups.value.length >= (groupListData.value?.count || 0)) {
    isAtBottom.value = false
    return
  }

  isLoadingMore.value = true
  curPage.value++

  try {
    await refetchGroups()
    // 数据会在 watch 中自动追加
  }
  catch (error) {
    console.error('加载更多群组失败:', error)
    // 加载失败时回退页码
    curPage.value--
  }
  finally {
    isLoadingMore.value = false
    // 加载完成后重置 isAtBottom 状态
    isAtBottom.value = false
  }
}

// 监听 isAtBottom 状态，当滚动到底部时加载更多数据
watch(isAtBottom, (value) => {
  if (value) {
    loadMoreGroups()
  }
})

// 处理刷新数据
async function handleRefresh() {
  // 重置到第一页并重新加载
  curPage.value = 0
  allGroups.value = []
  await refetchGroups()
}
</script>

<template>
  <BackLayout title="群组管理">
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- 按钮区域 -->
        <div class="mb-4">
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded"
            @click="router.push('/groups/add-group')"
          >
            添加群组
          </button>
        </div>

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
        <div v-else-if="allGroups.length" class="space-y-4">
          <div
            v-for="group in allGroups"
            :key="group.id"
            class="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 flex-1 min-w-0">
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
              <GroupActions :group="group" @refresh="handleRefresh" />
            </div>
          </div>
        </div>

        <!-- 空数据状态 -->
        <div v-else class="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          暂无群组数据
        </div>

        <!-- 加载更多状态 -->
        <div v-if="isLoadingMore" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-600 text-sm">
            加载中...
          </div>
        </div>

        <!-- 没有更多数据提示 -->
        <div v-else-if="allGroups.length > 0 && allGroups.length >= (groupListData?.count || 0)" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-400 text-sm">
            已加载全部数据（共 {{ groupListData?.count || 0 }} 条）
          </div>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
