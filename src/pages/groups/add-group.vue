<script setup lang="ts">
import type { Dept, Group } from '~/types/management'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import AvatarUpload from '~/components/AvatarUpload.vue'
import BackLayout from '~/components/BackLayout.vue'
import { useForm } from '~/composables/useForm'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 表单验证 schema
const addGroupSchema = z.object({
  name: z.string().min(1, '群组名称不能为空'),
  dept_id: z.number().int().min(0, '请选择部门'),
  avatar: z.string().optional().or(z.literal('')),
  burst_mode: z.number().int().min(0).max(1),
})

type AddGroupForm = z.infer<typeof addGroupSchema>

const router = useRouter()

// 获取部门列表
const {
  data: depts,
} = useWeilaFetch<Dept[]>('/corp/address/get-all-dept')
  .post()
  .json()

// 表单数据
const formData = ref<AddGroupForm>({
  name: '',
  dept_id: 0,
  avatar: '',
  burst_mode: 0,
})

// 表单验证
const { errors, validate } = useForm(addGroupSchema)

// 调用创建群组 API
const { error, isFetching, isFinished, data, execute: createGroup } = useWeilaFetch<{ group: Group }>('/corp/group/create-group', {
  immediate: false,
}).post(() => ({
  name: formData.value.name,
  dept_id: formData.value.dept_id,
  avatar: formData.value.avatar || 'http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100011/a/0e9763d6.jpg',
  burst_mode: formData.value.burst_mode,
})).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 监听创建群组成功
watch([data, isFinished, error], ([result, finished, err]) => {
  if (!finished)
    return
  if (err)
    return
  if (result !== undefined) {
    alert('群组创建成功')
    router.back()
  }
})

function handleSubmit() {
  if (!validate(formData.value)) {
    return
  }
  createGroup()
}
</script>

<template>
  <BackLayout title="添加群组">
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- 群组名称输入框 -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                群组名称
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="请输入群组名称"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.name ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
              <div v-if="errors.name" class="mt-1 text-sm text-red-600">
                {{ errors.name }}
              </div>
            </div>

            <!-- 部门选择 -->
            <div>
              <label for="dept_id" class="block text-sm font-medium text-gray-700 mb-1">
                所属部门
              </label>
              <select
                id="dept_id"
                v-model.number="formData.dept_id"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.dept_id ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
                <option :value="0">
                  无部门
                </option>
                <option
                  v-for="dept in depts"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.name }}
                </option>
              </select>
              <div v-if="errors.dept_id" class="mt-1 text-sm text-red-600">
                {{ errors.dept_id }}
              </div>
            </div>

            <!-- 头像上传按钮 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                头像
              </label>
              <AvatarUpload v-model="formData.avatar" />
            </div>

            <!-- 突发模式 -->
            <div>
              <label for="burst_mode" class="block text-sm font-medium text-gray-700 mb-1">
                突发模式
              </label>
              <select
                id="burst_mode"
                v-model.number="formData.burst_mode"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.burst_mode ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
                <option :value="0">
                  关闭
                </option>
                <option :value="1">
                  开启
                </option>
              </select>
              <div v-if="errors.burst_mode" class="mt-1 text-sm text-red-600">
                {{ errors.burst_mode }}
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
