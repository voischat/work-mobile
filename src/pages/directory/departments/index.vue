<script setup lang="ts">
import type { Dept, DeptListResponse } from '~/types/management'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from '~/components/Avatar.vue'
import BackLayout from '~/components/BackLayout.vue'
import DeptActions from '~/components/DeptActions.vue'
import DeptAddForm from '~/components/forms/DeptAddForm.vue'
import Modal from '~/components/Modal.vue'
import { usePage } from '~/composables/usePage'
import { useWeilaFetch } from '~/composables/useWeilaFetch'
import { isAtBottom } from '~/shared/states'

const router = useRouter()

// 表单引用
const deptAddFormRef = ref<InstanceType<typeof DeptAddForm>>()

// 模态框可见性状态
const isDeptModalOpen = ref(false)

// 分页状态
const { curPage, pageSize } = usePage()
const allDepts = ref<Dept[]>([]) // 累积存储所有已加载的部门
const isLoadingMore = ref(false) // 是否正在加载更多
const lastPageItemCount = ref(0) // 最后一次返回的列表长度，用于判断是否还有更多数据

// 动态构建 API URL
const deptListUrl = computed(() => `/corp/address/get-my-manage-dept-list?page=${curPage.value}&size=${pageSize}`)

// 获取部门列表
const {
  data: deptListData,
  error: deptError,
  isFetching: isDeptFetching,
  execute: refetchDepts,
} = useWeilaFetch<DeptListResponse>(deptListUrl)
  .post()
  .json()

// 监听初始数据加载完成，填充 allDepts
watch(deptListData, (newData) => {
  if (newData?.depts) {
    const depts = newData.depts || []
    lastPageItemCount.value = depts.length

    if (curPage.value === 0) {
      // 初始加载时，直接设置 allDepts
      allDepts.value = [...depts]
    }
    else {
      // 加载更多时，追加到 allDepts
      allDepts.value.push(...depts)
    }
  }
}, { immediate: true })

// 加载更多部门
async function loadMoreDepts() {
  // 防止重复加载
  if (isLoadingMore.value || isDeptFetching.value) {
    isAtBottom.value = false
    return
  }

  // 检查是否还有更多数据（通过最后一次返回的列表长度判断）
  if (lastPageItemCount.value > 0 && lastPageItemCount.value < pageSize) {
    isAtBottom.value = false
    return
  }

  isLoadingMore.value = true
  curPage.value++

  try {
    await refetchDepts()
    // 加载成功后重置 isAtBottom 状态
    isAtBottom.value = false
  }
  catch (error) {
    console.error('加载更多部门失败:', error)
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
    loadMoreDepts()
  }
})

// 处理刷新数据
async function handleRefresh() {
  // 重置到第一页并重新加载
  curPage.value = 0
  allDepts.value = []
  await refetchDepts()
}

// 处理创建部门 - 显示模态框
function handleAddDept() {
  isDeptModalOpen.value = true
}

// 处理创建部门模态框确认事件
async function handleDeptConfirm() {
  const result = await deptAddFormRef.value?.submit()
  console.log('result', result)
  if (result) {
    isDeptModalOpen.value = false
    await handleRefresh()
  }
}

// 处理创建部门模态框取消事件
function handleDeptCancel() {
  // 模态框关闭时重置表单
  deptAddFormRef.value?.reset()
  isDeptModalOpen.value = false
}

// 处理部门卡片点击，跳转到部门成员列表
function handleDeptClick(deptId: number) {
  router.push(`/directory/departments/${deptId}/members`)
}
</script>

<template>
  <BackLayout title="部门管理">
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- 按钮区域 -->
        <div class="mb-4">
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded"
            @click="handleAddDept"
          >
            创建部门
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="isDeptFetching" class="flex items-center justify-center py-12">
          <div class="text-gray-600">
            加载中...
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="deptError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">
            <p>获取部门列表失败: {{ deptError.message }}</p>
          </div>
        </div>

        <!-- 部门列表 -->
        <div v-else-if="allDepts?.length" class="space-y-4">
          <div
            v-for="dept in allDepts"
            :key="dept.id"
            class="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div class="flex items-center justify-between">
              <div
                class="flex-1 cursor-pointer hover:bg-gray-50 -m-4 p-4 rounded-lg transition-colors flex items-center space-x-3"
                @click="handleDeptClick(dept.id)"
              >
                <Avatar
                  src=""
                  :alt="dept.name"
                  size="md"
                  shape="rounded"
                />
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">
                    {{ dept.name }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    成员数量: {{ dept.user_count }}
                  </p>
                </div>
              </div>
              <div @click.stop>
                <DeptActions :dept="dept" @refresh="handleRefresh" />
              </div>
            </div>
          </div>
        </div>

        <!-- 空数据状态 -->
        <div v-else class="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          暂无部门数据
        </div>

        <!-- 加载更多状态 -->
        <div v-if="isLoadingMore" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-600 text-sm">
            加载中...
          </div>
        </div>

        <!-- 没有更多数据提示 -->
        <div v-else-if="allDepts.length > 0 && lastPageItemCount > 0 && lastPageItemCount < pageSize" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-400 text-sm">
            已加载全部数据（共 {{ allDepts.length }} 条）
          </div>
        </div>
      </div>
    </div>

    <!-- 创建部门模态框 -->
    <Modal
      v-model:open="isDeptModalOpen"
      title="创建部门"
      confirm-text="确认创建"
      cancel-text="取消"
      :on-confirm="handleDeptConfirm"
      :on-cancel="handleDeptCancel"
    >
      <DeptAddForm
        ref="deptAddFormRef"
      />
    </Modal>
  </BackLayout>
</template>
