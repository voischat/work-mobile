<script setup lang="ts">
import type { Dept, Member, MemberListResponse } from '~/types/management'
import { refDebounced } from '@vueuse/core'
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import DeptMemberTreeSelector from '~/components/DeptMemberTreeSelector.vue'
import MemberActions from '~/components/MemberActions.vue'
import MemberCard from '~/components/MemberCard.vue'
import Modal from '~/components/Modal.vue'
import { usePage } from '~/composables/usePage'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'
import { isAtBottom } from '~/shared/states'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const deptId = computed(() => Number(route.params.id))

const isAddMemberModalOpen = ref(false)
const treeSelectorRef = ref<InstanceType<typeof DeptMemberTreeSelector> | null>(null)
const selectedMemberIds = ref(new Set<number>())

const searchKey = shallowRef('')
const debouncedSearchKey = refDebounced(searchKey, 1000)

const { curPage, pageSize, reset } = usePage()
const allMembers = ref<Member[]>([])
const isLoadingMore = ref(false)

const {
  data: allDepts,
} = useWeilaFetch<Dept[]>('/corp/address/get-my-manage-all-dept')
  .post()
  .json()

const memberListUrl = computed(() => `/corp/address/get-dept-member-list?page=${curPage.value}&size=${pageSize}`)

const {
  data: memberListData,
  error: memberError,
  isFetching: isMemberFetching,
  execute: refetchMembers,
} = useWeilaFetch<MemberListResponse>(memberListUrl)
  .post(() => ({
    dept_id: deptId.value,
    member_types: [],
    key: debouncedSearchKey.value,
  }))
  .json()

watch(memberListData, (newData) => {
  if (newData?.members) {
    if (curPage.value === 0) {
      allMembers.value = [...newData.members]
    }
    else {
      allMembers.value.push(...newData.members)
    }
  }
}, { immediate: true })

watch(deptId, () => {
  reset()
  allMembers.value = []
  refetchMembers()
})

watch(debouncedSearchKey, () => {
  reset()
  allMembers.value = []
  refetchMembers()
})

async function loadMoreMembers() {
  if (isLoadingMore.value || isMemberFetching.value) {
    isAtBottom.value = false
    return
  }

  if (allMembers.value.length >= (memberListData.value?.count || 0)) {
    isAtBottom.value = false
    return
  }

  isLoadingMore.value = true
  curPage.value++

  try {
    await refetchMembers()
    isAtBottom.value = false
  }
  catch (error) {
    console.error('加载更多成员失败:', error)
    curPage.value--
  }
  finally {
    isLoadingMore.value = false
  }
}

watch(isAtBottom, (value) => {
  if (value) {
    loadMoreMembers()
  }
})

function getDeptName(deptId: number): string {
  return allDepts.value?.find((d: Dept) => d.id === deptId)?.name || ''
}

function handleDeptChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newDeptId = Number(target.value)
  if (newDeptId !== deptId.value) {
    router.replace(`/directory/departments/${newDeptId}/members`)
  }
}

async function handleRefresh() {
  reset()
  allMembers.value = []
  await refetchMembers()
}

async function handleAddMembersConfirm() {
  if (selectedMemberIds.value.size === 0) {
    showToast('请至少选择一个成员')
    return
  }

  try {
    const {
      execute: addMembersToDept,
    } = useWeilaFetch('/corp/address/add-dept-members', {
      immediate: false,
    })
      .post(() => ({
        dept_id: deptId.value,
        user_ids: Array.from(selectedMemberIds.value),
      }))
      .json()

    await addMembersToDept()
    showToast('添加成员成功')
    isAddMemberModalOpen.value = false
    treeSelectorRef.value?.clearSelection()
    await handleRefresh()
  }
  catch (error) {
    console.error('添加成员失败:', error)
    showToast('添加成员失败')
  }
}

const { data: deptAllMembers, execute: refreshDeptAllMembers } = useWeilaFetch<
  MemberListResponse
>('/corp/address/get-dept-all-member', {
  immediate: false,
})
  .post(() => ({
    dept_id: deptId.value,
  }))
  .json()

watch(isAddMemberModalOpen, (open) => {
  if (open) {
    refreshDeptAllMembers()
  }
})

const existingMemberIds = computed(() => deptAllMembers.value.map((i: any) => i.user_id))

function openAddMemberModal() {
  isAddMemberModalOpen.value = true
}
</script>

<template>
  <BackLayout :title="getDeptName(deptId) || '部门成员列表'">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '部门列表', steps: 1 },
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

        <!-- 加载状态 -->
        <div v-if="isMemberFetching && curPage === 0" class="flex items-center justify-center py-12">
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

        <!-- 空数据状态 -->
        <div v-else-if="allMembers.length === 0 && !isMemberFetching" class="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          暂无成员数据
        </div>

        <!-- 成员列表 -->
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

    <!-- 添加成员Modal -->
    <Modal
      v-model:open="isAddMemberModalOpen"
      title="选择成员"
    >
      <DeptMemberTreeSelector
        ref="treeSelectorRef"
        v-model:selected-member-ids="selectedMemberIds"
        :existing-member-ids="existingMemberIds"
      />
      <template #footer>
        <div class="flex items-center justify-between">
          <!-- 左侧显示选中数量 -->
          <div class="text-sm text-gray-600">
            <span class="font-medium text-blue-600">{{ selectedMemberIds.size }}</span> 位成员已选择
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
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              @click="() => handleAddMembersConfirm()"
            >
              确认添加
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </BackLayout>
</template>
