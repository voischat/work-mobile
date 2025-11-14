<script setup lang="ts">
import type { Dept } from '~/types/management'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import BackLayout from '~/components/BackLayout.vue'
import { useForm } from '~/composables/useForm'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 表单验证 schema
const addDeptSchema = z.object({
  name: z.string().min(1, '部门名称不能为空'),
})

type AddDeptForm = z.infer<typeof addDeptSchema>

const router = useRouter()

// 表单数据
const formData = ref<AddDeptForm>({
  name: '',
})

// 表单验证
const { errors, validate } = useForm(addDeptSchema)

// 调用创建部门 API
const { error, isFetching, isFinished, data, execute: createDept } = useWeilaFetch<{ dept: Dept }>('/corp/address/create-dept', {
  immediate: false,
}).post(() => ({
  name: formData.value.name,
})).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 监听创建部门成功
watch([data, isFinished, error], ([result, finished, err]) => {
  if (!finished)
    return
  if (err)
    return
  if (result !== undefined) {
    alert('部门创建成功')
    router.back()
  }
})

function handleSubmit() {
  if (!validate(formData.value)) {
    return
  }
  createDept()
}
</script>

<template>
  <BackLayout title="添加部门">
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- 部门名称输入框 -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                部门名称
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="请输入部门名称"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.name ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
              <div v-if="errors.name" class="mt-1 text-sm text-red-600">
                {{ errors.name }}
              </div>
            </div>

            <!-- 错误提示 -->
            <div v-if="errorMessage" class="text-sm text-red-600">
              {{ errorMessage }}
            </div>

            <!-- 按钮组 -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isFetching"
                @click="router.back()"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isFetching"
              >
                {{ isFetching ? '创建中...' : '确认创建' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
