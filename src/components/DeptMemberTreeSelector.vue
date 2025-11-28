<script setup lang="ts">
import type { Dept, Member } from '~/types/management'
import { computed, ref } from 'vue'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

const props = withDefaults(defineProps<{
  existingMemberIds?: number[]
}>(), {
  existingMemberIds: () => [],
})

// 使用 defineModel 进行双向绑定
const selectedMemberIds = defineModel<Set<number>>('selectedMemberIds', {
  default: () => new Set(),
  required: true,
})

// 已存在成员的ID集合（计算属性）
const existingMemberIdsSet = computed(() => new Set(props.existingMemberIds))

// 将 v-model 转换为 Set 便于操作
const selectedMemberIdsSet = computed(() => new Set(selectedMemberIds.value))

// 展开的部门ID集合
const expandedDeptIds = ref<Set<number>>(new Set())

// 部门成员数据缓存：部门ID -> 成员列表
const deptMembersCache = ref<Map<number, Member[]>>(new Map())

// 正在加载成员的部门ID
const loadingDeptIds = ref<Set<number>>(new Set())

// 获取部门列表
const {
  data: depts,
  isFetching: isDeptsLoading,
} = useWeilaFetch<Dept[]>('/corp/address/get-my-manage-all-dept')
  .post()
  .json()

// 切换部门展开/折叠
function toggleDept(deptId: number) {
  if (expandedDeptIds.value.has(deptId)) {
    expandedDeptIds.value.delete(deptId)
  }
  else {
    expandedDeptIds.value.add(deptId)
    // 如果该部门的成员还未加载，则加载
    if (!deptMembersCache.value.has(deptId)) {
      loadDeptMembers(deptId)
    }
  }
}

// 存储每个部门的 fetch 实例（在 setup 顶层创建）
// 注意：pickWeilaData 会提取 members 字段，所以返回的是 Member[] 数组
const deptMemberFetchers = new Map<number, ReturnType<typeof useWeilaFetch<Member[]>>>()

// 获取或创建部门的 fetch 实例
function getDeptMemberFetcher(deptId: number) {
  if (!deptMemberFetchers.has(deptId)) {
    const fetcher = useWeilaFetch<Member[]>('/corp/address/get-dept-all-member', {
      immediate: false,
    })
      .post(() => ({
        dept_id: deptId,
      }))
      .json()
    deptMemberFetchers.set(deptId, fetcher)
  }
  return deptMemberFetchers.get(deptId)!
}

// 加载部门成员
async function loadDeptMembers(deptId: number) {
  // 防止重复加载
  if (loadingDeptIds.value.has(deptId)) {
    return
  }

  loadingDeptIds.value.add(deptId)

  try {
    const fetcher = getDeptMemberFetcher(deptId)
    await fetcher.execute()

    // pickWeilaData 会自动提取 members 字段，所以 data.value 直接是 Member[] 数组
    const members = fetcher.data.value
    if (Array.isArray(members)) {
      deptMembersCache.value.set(deptId, members)
    }
    else {
      // 如果没有成员或格式不对，设置为空数组
      deptMembersCache.value.set(deptId, [])
    }
  }
  catch (error) {
    console.error(`加载部门 ${deptId} 的成员失败:`, error)
    // 出错时也设置为空数组，避免重复请求
    deptMembersCache.value.set(deptId, [])
  }
  finally {
    loadingDeptIds.value.delete(deptId)
  }
}

// 切换成员选中状态
function toggleMember(memberId: number) {
  // 如果成员已存在，不允许取消选择
  if (existingMemberIdsSet.value.has(memberId)) {
    return
  }

  const newSelectedSet = new Set(selectedMemberIds.value)

  if (newSelectedSet.has(memberId)) {
    newSelectedSet.delete(memberId)
  }
  else {
    newSelectedSet.add(memberId)
  }

  selectedMemberIds.value = newSelectedSet
}

// 获取部门的成员列表
function getDeptMembers(deptId: number): Member[] {
  return deptMembersCache.value.get(deptId) || []
}

// 检查部门是否正在加载
function isDeptLoading(deptId: number): boolean {
  return loadingDeptIds.value.has(deptId)
}

// 检查成员是否被选中
function isMemberSelected(memberId: number): boolean {
  return selectedMemberIdsSet.value.has(memberId) || existingMemberIdsSet.value.has(memberId)
}

// 检查成员是否已存在
function isMemberExisting(memberId: number): boolean {
  return existingMemberIdsSet.value.has(memberId)
}

// 暴露给父组件的方法和属性
defineExpose({
  clearSelection: () => {
    selectedMemberIds.value = new Set()
  },
})
</script>

<template>
  <div>
    <!-- 部门列表加载状态 -->
    <div v-if="isDeptsLoading" class="flex items-center justify-center py-8">
      <div class="text-gray-600">
        加载部门列表中...
      </div>
    </div>

    <!-- 部门列表 -->
    <div v-else-if="depts && depts.length > 0" class="space-y-1">
      <div
        v-for="dept in depts"
        :key="dept.id"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <!-- 部门节点 -->
        <div
          class="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          @click="toggleDept(dept.id)"
        >
          <div class="flex items-center space-x-3 flex-1">
            <!-- 展开/折叠图标 -->
            <svg
              class="w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0"
              :class="{ 'rotate-90': expandedDeptIds.has(dept.id) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <!-- 部门名称 -->
            <span class="font-medium text-gray-900">{{ dept.name }}</span>
            <!-- 成员数量 -->
            <span class="text-sm text-gray-500">({{ dept.user_count }}人)</span>
          </div>
        </div>

        <!-- 成员列表（展开时显示） -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[1000px]"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[1000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="expandedDeptIds.has(dept.id)" class="bg-white border-t border-gray-200">
            <!-- 加载状态 -->
            <div v-if="isDeptLoading(dept.id)" class="px-4 py-8 text-center text-gray-500 text-sm">
              加载成员中...
            </div>
            <!-- 空状态 -->
            <div v-else-if="getDeptMembers(dept.id).length === 0" class="px-4 py-8 text-center text-gray-500 text-sm">
              该部门暂无成员
            </div>
            <!-- 成员列表 -->
            <div v-else class="divide-y divide-gray-100">
              <div
                v-for="member in getDeptMembers(dept.id)"
                :key="member.user_id"
                class="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                @click.stop="toggleMember(member.user_id)"
              >
                <!-- 复选框 -->
                <input
                  type="checkbox"
                  :checked="isMemberSelected(member.user_id)"
                  :disabled="isMemberExisting(member.user_id)"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  :class="{
                    'cursor-pointer': !isMemberExisting(member.user_id),
                    'cursor-not-allowed opacity-50': isMemberExisting(member.user_id),
                  }"
                  @click.stop="toggleMember(member.user_id)"
                >
                <!-- 头像 -->
                <img
                  :src="member.avatar"
                  :alt="member.name"
                  class="w-10 h-10 rounded-full object-cover flex-shrink-0"
                >
                <!-- 成员信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <div class="text-sm font-medium text-gray-900">
                      {{ member.name || '未命名' }}
                    </div>
                    <span
                      v-if="isMemberExisting(member.user_id)"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                    >
                      已添加
                    </span>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ member.user_num }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-8 text-gray-500">
      暂无部门数据
    </div>
  </div>
</template>
