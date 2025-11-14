<script setup lang="ts">
import type { Dept, Member, MemberListResponse } from '~/types/management'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BackLayout from '~/components/BackLayout.vue'
import MemberActions from '~/components/MemberActions.vue'
import MemberCard from '~/components/MemberCard.vue'
import { usePage } from '~/composables/usePage'
import { useWeilaFetch } from '~/composables/useWeilaFetch'
import { isAtBottom } from '~/shared/states'

const router = useRouter()

// 分页状态
const { curPage, pageSize } = usePage()
const allMembers = ref<Member[]>([]) // 累积存储所有已加载的成员
const isLoadingMore = ref(false) // 是否正在加载更多

// 动态构建 API URL
const memberListUrl = computed(() => `/corp/address/get-member-list?page=${curPage.value}&size=${pageSize}`)

// 获取成员列表
const {
  data: memberListData,
  error: memberError,
  isFetching: isMemberFetching,
  execute: refetchMembers,
} = useWeilaFetch<MemberListResponse>(memberListUrl)
  .post(() => ({
    key: '',
  }))
  .json()

// 监听数据加载完成，填充 allMembers
watch(memberListData, (newData) => {
  if (newData?.members) {
    if (curPage.value === 0) {
      // 初始加载时，直接设置 allMembers
      allMembers.value = [...newData.members]
    }
    else {
      // 加载更多时，追加到 allMembers
      allMembers.value.push(...newData.members)
    }
  }
}, { immediate: true })

// 加载更多成员
async function loadMoreMembers() {
  // 防止重复加载
  if (isLoadingMore.value || isMemberFetching.value) {
    isAtBottom.value = false
    return
  }

  // 检查是否还有更多数据
  if (allMembers.value.length >= (memberListData.value?.count || 0)) {
    isAtBottom.value = false
    return
  }

  isLoadingMore.value = true
  curPage.value++

  try {
    await refetchMembers()
    // 数据会在 watch 中自动追加
    // 加载成功后重置 isAtBottom 状态
    isAtBottom.value = false
  }
  catch (error) {
    console.error('加载更多成员失败:', error)
    // 加载失败时回退页码
    curPage.value--
  }
  finally {
    isLoadingMore.value = false
  }
}

// 监听 isAtBottom 状态，当滚动到底部时加载更多数据
watch(isAtBottom, (value) => {
  if (value) {
    loadMoreMembers()
  }
})

// 获取部门列表（用于显示部门名称）
const {
  data: depts,
} = useWeilaFetch<Dept[]>('/corp/address/get-all-dept')
  .post()
  .json()

// 根据部门ID获取部门名称
function getDeptName(deptId: number): string {
  return depts.value?.find((d: Dept) => d.id === deptId)?.name || ''
}

// 处理刷新数据
async function handleRefresh() {
  // 重置到第一页并重新加载
  curPage.value = 0
  allMembers.value = []
  await refetchMembers()
}
</script>

<template>
  <BackLayout title="成员管理">
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- 按钮区域 -->
        <div class="mb-4 flex space-x-2">
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded"
            @click="router.push('/members/add-member')"
          >
            创建成员
          </button>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded"
            @click="router.push('/members/add-device')"
          >
            添加设备
          </button>
        </div>

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

        <div v-if="allMembers.length === 0" class="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          暂无成员数据
        </div>

        <div v-else class="space-y-4">
          <MemberCard
            v-for="member in allMembers"
            :key="member.user_id"
            :member
            :dept-name="getDeptName(member.dept_id)"
          >
            <template #actions>
              <MemberActions :member="member" @refresh="handleRefresh" />
            </template>
          </MemberCard>
        </div>

        <!-- 加载更多状态 -->
        <div v-if="isLoadingMore" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-600 text-sm">
            加载中...
          </div>
        </div>

        <!-- 没有更多数据提示 -->
        <div v-else-if="allMembers.length > 0 && allMembers.length >= (memberListData?.count || 0)" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-400 text-sm">
            已加载全部数据（共 {{ memberListData?.count || 0 }} 条）
          </div>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
