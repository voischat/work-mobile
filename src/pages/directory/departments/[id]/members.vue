<script setup lang="ts">
import type { Dept, Member, MemberListResponse, TreeNode } from '~/types/management'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { refDebounced, useInfiniteScroll } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'
import { computed, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import MemberActions from '~/components/MemberActions.vue'
import MemberCard from '~/components/MemberCard.vue'
import Modal from '~/components/Modal.vue'
import TreeSelector from '~/components/TreeSelector.vue'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const router = useRouter()
const queryCache = useQueryCache()
const { showToast } = useToast()

const deptId = computed(() => Number(useRouteParams('id').value))

const isAddMemberModalOpen = ref(false)
const treeSelectorRef = ref<InstanceType<typeof TreeSelector> | null>(null)
const selectedNodes = ref<TreeNode[]>([])

const searchKey = shallowRef('')
const debouncedSearchKey = refDebounced(searchKey, 1000)

const currentPage = ref(0)
const accumulatedMembers = ref<Member[]>([])
const pageSize = 10

const { data: allDepts } = useQuery({
  key: ['dept', 'my-manage'],
  query: () => weilaFetch<Dept[]>('/corp/address/get-my-manage-all-dept', { method: 'POST' }),
})

const {
  data,
  status,
  error,
} = useQuery({
  key: () => ['dept', deptId.value, 'members', 'list', { key: debouncedSearchKey.value, page: currentPage.value }],
  query: async () => {
    const result = await weilaFetch<MemberListResponse>(
      `/corp/address/get-dept-member-list?page=${currentPage.value}&size=${pageSize}`,
      {
        method: 'POST',
        body: {
          dept_id: deptId.value,
          member_types: [],
          key: debouncedSearchKey.value,
        },
      },
    )
    return result
  },
  placeholderData: previousData => previousData,
})

watch(data, (newData) => {
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

watch(deptId, () => {
  currentPage.value = 0
  accumulatedMembers.value = []
})

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

const loadMoreEl = useTemplateRef('load-more')
useInfiniteScroll(loadMoreEl, loadNextPage, { distance: 100 })

function getDeptName(deptId: number): string {
  return allDepts.value?.find((d: Dept) => d.id === deptId)?.name || ''
}

function getDeptCount(deptId: number): number {
  return allDepts.value?.find((d: Dept) => d.id === deptId)?.user_count || 0
}

function handleDeptChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newDeptId = Number(target.value)
  if (newDeptId !== deptId.value) {
    router.replace(`/directory/departments/${newDeptId}/members`)
  }
}

async function handleRefresh() {
  currentPage.value = 0
  accumulatedMembers.value = []
}

async function deptMemberLoader(ctx: TreeNode | null): Promise<TreeNode[]> {
  if (!ctx) {
    const depts = await weilaFetch<{ id: number, name: string, user_count: number }[]>('/corp/address/get-my-manage-all-dept', { method: 'POST' })
    return depts.map(d => ({
      id: d.id,
      label: d.name,
      type: 'dept' as const,
      count: d.user_count,
      expandable: true,
      selectable: false,
    }))
  }
  const members = await weilaFetch<{ user_id: number, name: string, avatar: string, user_num: string, dept_id: number }[]>('/corp/address/get-dept-all-member', {
    method: 'POST',
    body: { dept_id: ctx.id },
  })
  return members.map(m => ({
    id: m.user_id,
    label: m.name,
    type: 'member' as const,
    expandable: false,
    selectable: true,
    raw_data: m as Member,
  }))
}

const { mutate: addMembersToDept, isLoading: isAddingMembers } = useMutation({
  mutation: (userIds: number[]) =>
    weilaFetch('/corp/address/add-dept-members', {
      method: 'POST',
      body: {
        dept_id: deptId.value,
        user_ids: userIds,
      },
    }),
  async onSuccess() {
    showToast('添加成员成功')
    isAddMemberModalOpen.value = false
    treeSelectorRef.value?.clearSelection()
    await queryCache.invalidateQueries({ key: ['dept', deptId.value, 'members'] })
  },
  onError(error) {
    console.error('添加成员失败:', error)
    showToast('添加成员失败')
  },
})

async function handleAddMembersConfirm() {
  if (selectedNodes.value.length === 0) {
    showToast('请至少选择一个成员')
    return
  }

  addMembersToDept(selectedNodes.value.map(n => n.id))
}

const { data: deptAllMembers } = useQuery({
  key: () => ['dept', deptId.value, 'all-members'],
  query: () =>
    weilaFetch<MemberListResponse>('/corp/address/get-dept-all-member', {
      method: 'POST',
      body: { dept_id: deptId.value },
    }),
  enabled: computed(() => isAddMemberModalOpen.value),
})

const existingMemberIds = computed(() => deptAllMembers.value?.members?.map((i: Member) => i.user_id) || [])

function openAddMemberModal() {
  isAddMemberModalOpen.value = true
}

async function handleDeleteDeptMember(member: Member) {
  const queryCache = useQueryCache()

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

  // Optimistically remove member from dept member cache lists
  entries.forEach((entry) => {
    const key = entry.key
    if (Array.isArray(key) && key[0] === 'dept' && key[1] === deptId.value && key[2] === 'members') {
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
  queryCache.cancelQueries({ key: ['dept', deptId.value, 'members'] })

  try {
    await weilaFetch('/corp/address/delete-member', {
      method: 'POST',
      body: { user_id: member.user_id },
    })

    // Show success toast
    showToast('注销成功')

    // On success, invalidate to refetch in background
    await queryCache.invalidateQueries({ key: ['dept', deptId.value, 'members'] })
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

function handleEditDeptMember(member: Member) {
  // Update the member in accumulated list
  // Note: EditMemberForm's optimistic update already updated the cache
  // We just need to sync accumulatedMembers with cache data
  const entries = queryCache.getEntries()
  entries.forEach((entry) => {
    const key = entry.key
    if (Array.isArray(key) && key[0] === 'dept' && key[1] === deptId.value && key[2] === 'members') {
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
  <BackLayout :title="getDeptName(deptId) || '部门成员列表'">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '通讯录', route: '/directory' },
          { name: '部门管理', route: '/directory/departments' },
          { name: '部门成员列表' },
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- 部门选择下拉菜单和添加成员按钮 -->
        <div class="mb-4 space-y-4">
          <div>
            <label for="dept-select" class="block text-sm font-medium text-gray-700 mb-2">
              选择部门
            </label>
            <select
              id="dept-select"
              :value="deptId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleDeptChange"
            >
              <option
                v-for="dept in allDepts"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div>
            <input
              id="search-input"
              v-model="searchKey"
              type="text"
              placeholder="请输入成员姓名、手机号或工号"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div>
            <button
              type="button"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              @click="openAddMemberModal"
            >
              添加成员
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
            :dept-count="getDeptCount(member.dept_id)"
          >
            <template #actions>
              <MemberActions
                :member="member"
                :context="{ type: 'dept', id: deptId }"
                :handle-delete="handleDeleteDeptMember"
                :handle-edit-success="handleEditDeptMember"
                @refresh="handleRefresh"
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

    <!-- 添加成员Modal -->
    <Modal
      v-model:open="isAddMemberModalOpen"
      title="选择成员"
    >
      <TreeSelector
        ref="treeSelectorRef"
        v-model:selected-nodes="selectedNodes"
        :existing-node-ids="existingMemberIds"
        :load-more="deptMemberLoader"
        :cache-key="['directory', 'dept', 'add-members']"
      />
      <template #footer>
        <div class="flex items-center justify-between">
          <!-- 左侧显示选中数量 -->
          <div class="text-sm text-gray-600">
            <span class="font-medium text-blue-600">{{ selectedNodes.length }}</span> 位成员已选择
          </div>
          <!-- 右侧按钮组 -->
          <div class="flex space-x-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              @click="isAddMemberModalOpen = false"
            >
              取消
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isAddingMembers"
              @click="handleAddMembersConfirm"
            >
              {{ isAddingMembers ? '添加中...' : '确认添加' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </BackLayout>
</template>
