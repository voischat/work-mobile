<script setup lang="ts">
import type { Dept, Member, MemberListResponse } from '~/types/management'
import { refDebounced } from '@vueuse/core'
import { computed, ref, shallowRef, watch } from 'vue'
import BackLayout from '~/components/BackLayout.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import DeviceAddForm from '~/components/forms/DeviceAddForm.vue'
import MemberAddForm from '~/components/forms/MemberAddForm.vue'
import MemberActions from '~/components/MemberActions.vue'
import MemberCard from '~/components/MemberCard.vue'
import { useConfirmModal } from '~/composables/useConfirmModal'
import { usePage } from '~/composables/usePage'
import { useWeilaFetch } from '~/composables/useWeilaFetch'
import { isAtBottom } from '~/shared/states'

const { showConfirmModal, closeConfirmModal, confirmModal } = useConfirmModal()

// 表单引用
const memberAddFormRef = ref<InstanceType<typeof MemberAddForm>>()
const deviceAddFormRef = ref<InstanceType<typeof DeviceAddForm>>()

// 当前显示的模态框类型
const currentModal = ref<'member' | 'device' | null>(null)

// 搜索关键词（使用 shallowRef 用于防抖）
const searchKey = shallowRef('')
// 防抖后的搜索关键词（300ms 延迟）
const debouncedSearchKey = refDebounced(searchKey, 300)

// 分页状态
const { curPage, pageSize, reset } = usePage()
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
    key: debouncedSearchKey.value,
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

// 监听防抖后的搜索关键词变化，重置分页并重新加载数据
watch(debouncedSearchKey, () => {
  reset()
  allMembers.value = []
  refetchMembers()
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
  reset()
  allMembers.value = []
  await refetchMembers()
}

// 处理创建成员 - 显示模态框
async function handleAddMember() {
  currentModal.value = 'member'
  await showConfirmModal({
    title: '创建成员',
    confirmText: '确认创建',
    cancelText: '取消',
  })
}

// 处理添加设备 - 显示模态框
async function handleAddDevice() {
  currentModal.value = 'device'
  await showConfirmModal({
    title: '添加设备',
    confirmText: '确认添加',
    cancelText: '取消',
  })
}

// 处理模态框确认事件
async function handleConfirmModal() {
  let result = false

  // 根据当前模态框类型触发表单提交并等待结果
  if (currentModal.value === 'member') {
    result = await memberAddFormRef.value?.submit()
  }
  else if (currentModal.value === 'device') {
    result = await deviceAddFormRef.value?.submit()
  }

  if (result) {
    // 表单提交成功，关闭模态框并刷新成员列表
    closeConfirmModal(true)
    await handleRefresh()
  }
}

// 处理模态框取消事件
function handleCancelModal() {
  // 模态框关闭时重置表单
  if (currentModal.value === 'member') {
    memberAddFormRef.value?.reset()
  }
  else if (currentModal.value === 'device') {
    deviceAddFormRef.value?.reset()
  }
}
</script>

<template>
  <BackLayout title="成员管理">
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- 搜索和按钮区域 -->
        <div class="mb-4 space-y-4">
          <div>
            <input
              id="search-input"
              v-model="searchKey"
              type="text"
              placeholder="请输入成员姓名、手机号或工号"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div class="flex space-x-2">
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              @click="handleAddMember"
            >
              创建成员
            </button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              @click="handleAddDevice"
            >
              添加设备
            </button>
          </div>
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

    <!-- 创建成员模态框 -->
    <ConfirmModal
      v-if="currentModal === 'member'"
      :modal="confirmModal"
      @confirm="handleConfirmModal"
      @cancel="handleCancelModal"
    >
      <template #content>
        <MemberAddForm
          ref="memberAddFormRef"
        />
      </template>
    </ConfirmModal>

    <!-- 添加设备模态框 -->
    <ConfirmModal
      v-if="currentModal === 'device'"
      :modal="confirmModal"
      @confirm="handleConfirmModal"
      @cancel="handleCancelModal"
    >
      <template #content>
        <DeviceAddForm
          ref="deviceAddFormRef"
        />
      </template>
    </ConfirmModal>
  </BackLayout>
</template>
