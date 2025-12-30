<script setup lang="ts">
import type { Dept, DeptListResponse } from '~/types/management'
import { useQuery } from '@pinia/colada'
import { useInfiniteScroll } from '@vueuse/core'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from '~/components/Avatar.vue'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import DeptActions from '~/components/DeptActions.vue'
import DeptAddForm from '~/components/forms/DeptAddForm.vue'
import Modal from '~/components/Modal.vue'
import { weilaFetch } from '~/shared/instances'

const router = useRouter()

const deptAddFormRef = ref<InstanceType<typeof DeptAddForm>>()
const isDeptModalOpen = ref(false)

const currentPage = ref(0)
const accumulatedDepts = ref<Dept[]>([])
const pageSize = 10

const {
  data,
  status,
  error,
} = useQuery({
  key: () => ['dept', 'list', { page: currentPage.value }],
  query: async () => {
    return await weilaFetch<DeptListResponse>(
      `/corp/address/get-my-manage-dept-list?page=${currentPage.value}&size=${pageSize}`,
      { method: 'POST' },
    )
  },
})

watch(data, (newData) => {
  if (newData) {
    if (currentPage.value === 0) {
      accumulatedDepts.value = newData.depts || []
    }
    else {
      const newDepts = newData.depts || []
      const existingIds = new Set(accumulatedDepts.value.map(d => d.id))
      const uniqueNewDepts = newDepts.filter(d => !existingIds.has(d.id))
      accumulatedDepts.value = [...accumulatedDepts.value, ...uniqueNewDepts]
    }
  }
}, { immediate: true })

const hasNextPage = computed(() => {
  if (!data.value)
    return false
  const lastPageSize = data.value.depts?.length || 0
  return lastPageSize >= pageSize
})

function loadNextPage() {
  if (hasNextPage.value)
    currentPage.value += 1
}

const loadMoreEl = useTemplateRef('load-more')
useInfiniteScroll(loadMoreEl, loadNextPage, { distance: 100 })

async function handleRefresh() {
  currentPage.value = 0
  accumulatedDepts.value = []
}

function handleAddDept() {
  isDeptModalOpen.value = true
}

async function handleDeptConfirm() {
  const result = await deptAddFormRef.value?.submit()
  if (result) {
    isDeptModalOpen.value = false
    await handleRefresh()
  }
}

function handleDeptCancel() {
  deptAddFormRef.value?.reset()
  isDeptModalOpen.value = false
}

function handleDeptClick(deptId: number) {
  router.push(`/directory/departments/${deptId}/members`)
}
</script>

<template>
  <BackLayout title="部门管理">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '通讯录', steps: 1 },
          { name: '部门管理' },
        ]"
      />
    </template>
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

        <div v-if="status === 'pending' && accumulatedDepts.length === 0" class="flex items-center justify-center py-12">
          <div class="text-gray-600">
            加载中...
          </div>
        </div>

        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">
            <p>获取部门列表失败: {{ error.message }}</p>
          </div>
        </div>

        <div v-if="accumulatedDepts.length === 0 && status !== 'pending'" class="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          暂无部门数据
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="dept in accumulatedDepts"
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

        <!-- 加载更多指示器 -->
        <div v-if="hasNextPage" ref="load-more" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-600 text-sm">
            加载中...
          </div>
        </div>

        <!-- 已加载完成 -->
        <div v-else-if="accumulatedDepts.length > 0" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-400 text-sm">
            已加载全部数据（共 {{ accumulatedDepts.length }} 条）
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
