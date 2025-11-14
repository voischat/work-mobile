<script setup lang="ts">
import type { Dept } from '~/types/management'
import { useRouter } from 'vue-router'
import BackLayout from '~/components/BackLayout.vue'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

const router = useRouter()

// 获取部门列表（pickWeilaData 会自动提取 depts 数组）
const {
  data,
  error: deptError,
  isFetching: isDeptFetching,
} = useWeilaFetch<Dept[]>('/corp/address/get-my-manage-dept-list?page=0&size=10')
  .post()
  .json()

const depts = computed(() => data.value?.depts || [])
</script>

<template>
  <BackLayout title="部门管理">
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- 按钮区域 -->
        <div class="mb-4">
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded"
            @click="router.push('/departments/add-dept')"
          >
            添加部门
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
        <div v-else-if="depts?.length" class="space-y-4">
          <div
            v-for="dept in depts"
            :key="dept.id"
            class="bg-white rounded-lg shadow-md p-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  {{ dept.name }}
                </h3>
                <p class="text-sm text-gray-600">
                  成员数量: {{ dept.user_count }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 空数据状态 -->
        <div v-else class="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          暂无部门数据
        </div>
      </div>
    </div>
  </BackLayout>
</template>
