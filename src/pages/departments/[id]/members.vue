<script setup lang="ts">
import type { Dept, Member, MemberListResponse } from '~/types/management'
import { refDebounced } from '@vueuse/core'
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackLayout from '~/components/BackLayout.vue'
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

// 从路由参数获取部门ID
// @ts-expect-error - route.params.id 的类型定义问题
const deptId = computed(() => Number(route.params.id))

// 添加成员Modal状态
const isAddMemberModalOpen = ref(false)
const treeSelectorRef = ref<InstanceType<typeof DeptMemberTreeSelector> | null>(null)
const selectedMemberIds = ref(new Set<number>()) // 选中的成员ID集合

// 搜索关键词（使用 shallowRef 用于防抖）
const searchKey = shallowRef('')
// 防抖后的搜索关键词（300ms 延迟）
const debouncedSearchKey = refDebounced(searchKey, 300)

// 分页状态
const { curPage, pageSize, reset } = usePage()
const allMembers = ref<Member[]>([]) // 累积存储所有已加载的成员
const isLoadingMore = ref(false) // 是否正在加载更多

// 获取可管理的部门列表（用于下拉选择）
const {
  data: allDepts,
} = useWeilaFetch<Dept[]>('/corp/address/get-my-manage-all-dept')
  .post()
  .json()

// 动态构建 API URL
const memberListUrl = computed(() => `/corp/address/get-dept-member-list?page=${curPage.value}&size=${pageSize}`)

// 获取部门成员列表
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

// 监听部门ID变化，重置分页并重新加载数据
watch(deptId, () => {
  reset()
  allMembers.value = []
  refetchMembers()
})

// 监听防抖后的搜索关键词变化，重置分页并重新加载数据
watch(debouncedSearchKey, () => {
  reset()
  allMembers.value = []
  refetchMembers()
})

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

// 根据部门ID获取部门名称
function getDeptName(deptId: number): string {
  return allDepts.value?.find((d: Dept) => d.id === deptId)?.name || ''
}

// 处理部门切换
function handleDeptChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newDeptId = Number(target.value)
  if (newDeptId !== deptId.value) {
    router.replace(`/departments/${newDeptId}/members`)
  }
}

// 处理刷新数据
async function handleRefresh() {
  // 重置到第一页并重新加载
  reset()
  allMembers.value = []
  await refetchMembers()
}

// 处理添加成员确认
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
    // 清空选择
    treeSelectorRef.value?.clearSelection()
    // 刷新成员列表
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

// 打开添加成员Modal
function openAddMemberModal() {
  isAddMemberModalOpen.value = true
}
</script>

<template>
  <BackLayout title="部门成员">
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
        <div v-else-if="allMembers.length === 0" class="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
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
      <template #content>
        <DeptMemberTreeSelector
          ref="treeSelectorRef"
          v-model:selected-member-ids="selectedMemberIds"
          :existing-member-ids="existingMemberIds"
        />
      </template>
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
