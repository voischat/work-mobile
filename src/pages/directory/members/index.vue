<script setup lang="ts">
import type { Dept, Member, MemberListResponse } from '~/types/management'
import { useQuery, useQueryCache } from '@pinia/colada'

const memberAddFormRef = useTemplateRef('memberAddFormRef')
const deviceAddFormRef = useTemplateRef('deviceAddFormRef')
const queryCache = useQueryCache()
const { showToast } = useToast()

const isMemberModalOpen = ref(false)
const isDeviceModalOpen = ref(false)

const searchKey = shallowRef('')
const debouncedSearchKey = refDebounced(searchKey, 1000)

const currentPage = ref(0)
const accumulatedMembers = ref<MemberListResponse['members']>([])

const {
  data,
  status,
  error,
} = useQuery({
  key: () => ['member', 'list', { key: debouncedSearchKey.value, page: currentPage.value }],
  query: async () => {
    const result = await weilaFetch<MemberListResponse>(
      `/corp/address/get-member-list?page=${currentPage.value}&size=5`,
      {
        method: 'POST',
        body: { key: debouncedSearchKey.value },
      },
    )
    return result
  },
  // placeholderData: previousData => previousData,
})

watch(data, (newData) => {
  console.log('newData', newData)
  if (newData) {
    if (currentPage.value === 0) {
      accumulatedMembers.value = newData.members || []
    }
    else {
      const newMembers = newData.members || []
      const existingIds = new Set(accumulatedMembers.value.map(m => m.user_id))
      const uniqueNewMembers = newMembers.filter(m => !existingIds.has(m.user_id))
      accumulatedMembers.value = [...accumulatedMembers.value, ...uniqueNewMembers]
    }
  }
}, { immediate: true })

watch(debouncedSearchKey, () => {
  currentPage.value = 0
  accumulatedMembers.value = []
})

const hasNextPage = computed(() => {
  if (!data.value)
    return false
  const loadedCount = accumulatedMembers.value.length
  return loadedCount < (data.value.count || 0)
})

function loadNextPage() {
  if (hasNextPage.value)
    currentPage.value += 1
}

const { data: depts } = useQuery({
  key: ['dept', 'all'],
  query: () => weilaFetch<Dept[]>('/corp/address/get-all-dept', { method: 'POST' }),
})

function getDeptName(deptId: number): string {
  return depts.value?.find((d: Dept) => d.id === deptId)?.name || ''
}

const loadMoreEl = useTemplateRef('load-more')
useInfiniteScroll(loadMoreEl, loadNextPage, { distance: 100 })

function handleAddMember() {
  isMemberModalOpen.value = true
}

function handleAddDevice() {
  isDeviceModalOpen.value = true
}

async function handleMemberConfirm() {
  const result = await memberAddFormRef.value?.submit()
  if (result)
    isMemberModalOpen.value = false
}

function handleMemberCancel() {
  memberAddFormRef.value?.reset()
  isMemberModalOpen.value = false
}

async function handleDeviceConfirm() {
  const result = await deviceAddFormRef.value?.submit()
  if (result)
    isDeviceModalOpen.value = false
}

function handleDeviceCancel() {
  deviceAddFormRef.value?.reset()
  isDeviceModalOpen.value = false
}

async function handleDeleteMember(member: Member) {
  // Helper function to remove member from list
  const removeMemberFromList = (list: any[] | undefined) => {
    if (!list)
      return list
    return list.filter(item => item.user_id !== member.user_id)
  }

  // Get current data for rollback
  const entries = queryCache.getEntries()
  const oldData: Record<string, any> = {}
  const oldAccumulatedMembers = [...accumulatedMembers.value]

  // Optimistically remove member from accumulated list
  accumulatedMembers.value = accumulatedMembers.value.filter(m => m.user_id !== member.user_id)

  // Optimistically remove member from all cache lists
  entries.forEach((entry) => {
    const key = entry.key
    if (Array.isArray(key) && key[0] === 'member' && key[1] === 'list') {
      const data = queryCache.getQueryData<{ members: Member[], count: number }>(key)
      if (data?.members) {
        oldData[JSON.stringify(key)] = data
        queryCache.setQueryData(key, {
          ...data,
          members: removeMemberFromList(data.members),
          count: Math.max(0, (data.count || 0) - 1),
        })
      }
    }
  })

  // Cancel queries to prevent overwriting optimistic update
  queryCache.cancelQueries({ key: ['member', 'list'] })

  try {
    await weilaFetch('/corp/address/delete-member', {
      method: 'POST',
      body: { user_id: member.user_id },
    })

    // Show success toast
    showToast('注销成功')

    // On success, just invalidate to refetch in background
    await queryCache.invalidateQueries({ key: ['member', 'list'] })
  }
  catch (error) {
    // Show error toast
    showToast('注销失败')

    // Rollback accumulated members
    accumulatedMembers.value = oldAccumulatedMembers

    // Rollback cache
    Object.entries(oldData).forEach(([keyStr, data]) => {
      const key = JSON.parse(keyStr)
      queryCache.setQueryData(key, data)
    })
    throw error
  }
}

function handleEditMember(member: Member) {
  // Update the member in accumulated list
  // Note: EditMemberForm's optimistic update already updated the cache
  // We just need to sync accumulatedMembers with cache data
  const entries = queryCache.getEntries()
  entries.forEach((entry) => {
    const key = entry.key
    if (Array.isArray(key) && key[0] === 'member' && key[1] === 'list') {
      const data = queryCache.getQueryData<{ members: Member[], count: number }>(key)
      if (data?.members) {
        // Find updated member from cache
        const updatedMember = data.members.find(m => m.user_id === member.user_id)
        if (updatedMember) {
          // Update in accumulated list
          accumulatedMembers.value = accumulatedMembers.value.map(m =>
            m.user_id === member.user_id ? updatedMember : m,
          )
        }
      }
    }
  })
}
</script>

<template>
  <BackLayout title="成员管理">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '通讯录', route: '/directory' },
          { name: '成员管理' },
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
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

        <div v-if="status === 'pending' && accumulatedMembers.length === 0" class="flex items-center justify-center py-12">
          <div class="text-gray-600">
            加载中...
          </div>
        </div>

        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">
            <p>获取成员列表失败: {{ error.message }}</p>
          </div>
        </div>

        <div v-if="accumulatedMembers.length === 0 && status !== 'pending'" class="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          暂无成员数据
        </div>

        <div v-else class="space-y-4">
          <MemberCard
            v-for="member in accumulatedMembers"
            :key="member.user_id"
            :member
            :dept-name="getDeptName(member.dept_id)"
          >
            <template #actions>
              <MemberActions
                :member="member"
                :handle-delete="handleDeleteMember"
                :handle-edit-success="handleEditMember"
              />
            </template>
          </MemberCard>
        </div>

        <div v-if="hasNextPage" ref="load-more" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-600 text-sm">
            加载中...
          </div>
        </div>

        <div v-else-if="accumulatedMembers.length > 0" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-400 text-sm">
            已加载全部数据（共 {{ data?.count || 0 }} 条）
          </div>
        </div>
      </div>
    </div>

    <Modal
      v-model:open="isMemberModalOpen"
      title="创建成员"
      confirm-text="确认创建"
      cancel-text="取消"
      :on-confirm="handleMemberConfirm"
      :on-cancel="handleMemberCancel"
    >
      <MemberAddForm ref="memberAddFormRef" />
    </Modal>

    <Modal
      v-model:open="isDeviceModalOpen"
      title="添加设备"
      confirm-text="确认添加"
      cancel-text="取消"
      :on-confirm="handleDeviceConfirm"
      :on-cancel="handleDeviceCancel"
    >
      <DeviceAddForm ref="deviceAddFormRef" />
    </Modal>
  </BackLayout>
</template>
