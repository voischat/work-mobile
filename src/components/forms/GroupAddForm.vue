<script setup lang="ts">
import type { Dept, Group } from '~/types/management'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const { showToast } = useToast()

// 表单验证 schema
const addGroupSchema = z.object({
  name: z.string().min(1, '群组名称不能为空'),
  dept_id: z.number().int().min(0, '请选择部门'),
  avatar: z.string().optional().or(z.literal('')),
  burst_mode: z.number().int().min(0).max(1),
})

type AddGroupForm = z.infer<typeof addGroupSchema>

// 获取部门列表
const { data: depts } = useQuery({
  key: ['dept', 'all'],
  query: () => weilaFetch<Dept[]>('/corp/address/get-all-dept', { method: 'POST' }),
})

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
const { mutateAsync: createGroup, error } = useMutation({
  mutation: (payload: AddGroupForm) => weilaFetch<{ group: Group }>('/corp/group/create-group', {
    method: 'POST',
    body: {
      name: payload.name,
      dept_id: payload.dept_id,
      avatar: payload.avatar || 'http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100011/a/0e9763d6.jpg',
      burst_mode: payload.burst_mode,
    },
  }),
  onSuccess: () => {
    // Invalidate group queries on success
    const queryCache = useQueryCache()
    queryCache.invalidateQueries({ key: ['group'] })
  },
})

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 主要提交方法 - 暴露给父组件
async function submit(): Promise<false | { group: Group }> {
  if (!validate(formData.value)) {
    throw new Error(Object.values(errors.value)?.[0] || '表单验证失败')
  }

  try {
    const result = await createGroup(formData.value)

    if (error.value) {
      showToast(error.value.message || '群组创建失败')
      return false
    }

    if (result) {
      showToast('群组创建成功')
      return result
    }

    return false
  }
  catch (err) {
    console.error('群组创建失败:', err)
    showToast('群组创建失败')
    return false
  }
}

// 重置表单
function reset() {
  formData.value = {
    name: '',
    dept_id: 0,
    avatar: '',
    burst_mode: 0,
  }
}

// 暴露方法给父组件
defineExpose({
  submit,
  reset,
})
</script>

<template>
  <div class="space-y-4">
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
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.dept_id ? 'border-red-500' : 'border-gray-300'"
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

    <!-- 对讲模式 -->
    <div>
      <label for="burst_mode" class="block text-sm font-medium text-gray-700 mb-1">
        对讲模式
      </label>
      <select
        id="burst_mode"
        v-model.number="formData.burst_mode"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.burst_mode ? 'border-red-500' : 'border-gray-300'"
      >
        <option :value="0">
          排麦
        </option>
        <option :value="1">
          抢麦
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
  </div>
</template>
