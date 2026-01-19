<script setup lang="ts">
import type { Dept, Group, GroupListResponse, Member, MemberListResponse, TreeNode } from '~/types/management'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { useInfiniteScroll } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'
import { computed, ref, useTemplateRef, watch } from 'vue'
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
const { t } = useI18n()

const groupId = computed(() => Number(useRouteParams('id').value))

const isAddMemberModalOpen = ref(false)
const treeSelectorRef = ref<InstanceType<typeof TreeSelector> | null>(null)
const selectedNodes = ref<TreeNode[]>([])

const currentPage = ref(0)
const accumulatedMembers = ref<Member[]>([])
const pageSize = 10

const { data: groupInfo } = useQuery({
  key: ['group', 'my-manage'],
  query: () => weilaFetch<GroupListResponse>('/corp/group/get-my-manage-group-list?page=0&size=1000', { method: 'POST' }),
})

const groupName = computed(() => {
  if (groupInfo.value?.groups) {
    const group = groupInfo.value.groups.find((g: Group) => g.id === groupId.value)
    return group?.name || ''
  }
  return ''
})

const groupCount = computed(() => {
  if (groupInfo.value?.groups) {
    const group = groupInfo.value.groups.find((g: Group) => g.id === groupId.value)
    return group?.user_count || 0
  }
  return 0
})

const {
  data,
  status,
  error,
} = useQuery({
  key: () => ['group', groupId.value, 'members', 'list', { page: currentPage.value }],
  query: async () => {
    const result = await weilaFetch<MemberListResponse>(
      `/corp/group/get-group-member-list?page=${currentPage.value}&size=${pageSize}`,
      {
        method: 'POST',
        body: { group_id: groupId.value },
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

watch(groupId, () => {
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

const { data: allDepts } = useQuery({
  key: ['dept', 'my-manage'],
  query: () => weilaFetch<Dept[]>('/corp/address/get-my-manage-all-dept', { method: 'POST' }),
})

function getDeptName(deptId: number): string {
  return allDepts.value?.find((d: Dept) => d.id === deptId)?.name || ''
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

const { mutate: addMembersToGroup, isLoading: isAddingMembers } = useMutation({
  mutation: (userIds: number[]) =>
    weilaFetch('/corp/group/add-group-members', {
      method: 'POST',
      body: {
        group_id: groupId.value,
        user_ids: userIds,
      },
    }),
  async onSuccess() {
    showToast(t('directory.member.addSuccess'))
    isAddMemberModalOpen.value = false
    treeSelectorRef.value?.clearSelection()
    await queryCache.invalidateQueries({ key: ['group', groupId.value, 'members'] })
  },
  onError(error) {
    console.error('添加成员失败:', error)
    showToast(t('directory.member.addFailed'))
  },
})

async function handleAddMembersConfirm() {
  if (selectedNodes.value.length === 0) {
    showToast('请至少选择一个成员')
    return
  }

  addMembersToGroup(selectedNodes.value.map(n => n.id))
}

const { data: groupAllMembers } = useQuery({
  key: () => ['group', groupId.value, 'all-members'],
  query: () =>
    weilaFetch<MemberListResponse>('/corp/group/get-group-all-member', {
      method: 'POST',
      body: { group_id: groupId.value },
    }),
  enabled: computed(() => isAddMemberModalOpen.value),
})

const existingMemberIds = computed(() => groupAllMembers.value?.members?.map((i: Member) => i.user_id) || [])

function handleGroupChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newGroupId = Number(target.value)
  if (newGroupId !== groupId.value) {
    router.replace(`/directory/groups/${newGroupId}/members`)
  }
}

function openAddMemberModal() {
  isAddMemberModalOpen.value = true
}

async function handleDeleteGroupMember(member: Member) {
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

  // Optimistically remove member from group member cache lists
  entries.forEach((entry) => {
    const key = entry.key
    if (Array.isArray(key) && key[0] === 'group' && key[1] === groupId.value && key[2] === 'members') {
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
  queryCache.cancelQueries({ key: ['group', groupId.value, 'members'] })

  try {
    await weilaFetch('/corp/group/delete-group-member', {
      method: 'POST',
      body: {
        group_id: groupId.value,
        user_id: member.user_id,
      },
    })

    // Show success toast
    showToast('注销成功')

    // On success, invalidate to refetch in background
    await queryCache.invalidateQueries({ key: ['group', groupId.value, 'members'] })
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

function handleEditGroupMember(member: Member) {
  // Update the member in accumulated list
  // Note: EditMemberForm's optimistic update already updated the cache
  // We just need to sync accumulatedMembers with cache data
  const entries = queryCache.getEntries()
  entries.forEach((entry) => {
    const key = entry.key
    if (Array.isArray(key) && key[0] === 'group' && key[1] === groupId.value && key[2] === 'members') {
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
  <BackLayout :title="groupName || '群成员列表'">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '通讯录', route: '/directory' },
          { name: '群组管理', route: '/directory/groups' },
          { name: '群成员列表' },
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- 群组选择下拉菜单和添加成员按钮 -->
        <div class="mb-4 space-y-4">
          <div>
            <label for="group-select" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('directory.group.selectGroup') }}
            </label>
            <select
              id="group-select"
              :value="groupId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleGroupChange"
            >
              <option
                v-for="group in groupInfo?.groups"
                :key="group.id"
                :value="group.id"
              >
                {{ group.name }}
              </option>
            </select>
          </div>
          <div>
            <button
              type="button"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              @click="openAddMemberModal"
            >
              {{ t('directory.member.add') }}
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

        <!-- 成员列表 -->
        <div v-else class="space-y-4">
          <MemberCard
            v-for="member in accumulatedMembers"
            :key="member.user_id"
            :member
            :dept-name="getDeptName(member.dept_id)"
            :group-name="groupName"
            :group-count="groupCount"
          >
            <template #actions>
              <MemberActions
                :member="member"
                :context="{ type: 'group', id: groupId }"
                :handle-delete="handleDeleteGroupMember"
                :handle-edit-success="handleEditGroupMember"
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

        <!-- 没有更多数据提示 -->
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
      :title="t('directory.member.add')"
    >
      <TreeSelector
        ref="treeSelectorRef"
        v-model:selected-nodes="selectedNodes"
        :existing-node-ids="existingMemberIds"
        :load-more="deptMemberLoader"
        :cache-key="['directory', 'group', 'add-members']"
      />
      <template #footer>
        <div class="flex items-center justify-between">
          <!-- 左侧显示选中数量 -->
          <div class="text-sm text-gray-600">
            {{ t('common.messages.selectCount', { count: selectedNodes.length }) }}
          </div>
          <!-- 右侧按钮组 -->
          <div class="flex space-x-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              @click="isAddMemberModalOpen = false"
            >
              {{ t('common.actions.cancel') }}
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isAddingMembers"
              @click="handleAddMembersConfirm"
            >
              {{ isAddingMembers ? t('common.actions.adding') : t('common.actions.confirmAdd') }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </BackLayout>
</template>
