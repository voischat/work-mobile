<script setup lang="ts">
import type { Dept } from '~/types/management'
import { useMutation, useQueryCache } from '@pinia/colada'
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import { useForm } from '~/composables/useForm'
import { weilaFetch } from '~/shared/instances'

const props = defineProps<{
  dept: Dept
}>()

// 编辑部门的 schema
const editDeptSchema = z.object({
  dept_id: z.number(),
  name: z.string().min(1, '部门名称不能为空'),
})

type EditDeptForm = z.infer<typeof editDeptSchema>

// 表单数据
const formData = ref<EditDeptForm>({
  dept_id: props.dept?.id || 0,
  name: props.dept?.name || '',
})

// 监听 dept prop 变化，更新表单数据
watch(() => props.dept, (newDept) => {
  if (newDept) {
    formData.value = {
      dept_id: newDept.id || 0,
      name: newDept.name || '',
    }
  }
}, { immediate: true, deep: true })

// 表单验证
const { errors, validate } = useForm(editDeptSchema)

// 调用编辑部门 API
const { mutate: editDept, isLoading, error } = useMutation({
  mutation: (payload: EditDeptForm) => weilaFetch('/corp/address/change-dept', {
    method: 'POST',
    body: {
      dept_id: payload.dept_id,
      name: payload.name,
    },
  }),
  onSuccess: () => {
    // Invalidate dept queries on success
    const queryCache = useQueryCache()
    queryCache.invalidateQueries({ key: ['dept'] })
  },
})

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 提交方法，返回 Promise
async function submit(): Promise<void> {
  if (!validate(formData.value)) {
    throw new Error(Object.values(errors.value)?.[0] || '表单验证失败')
  }

  await editDept(formData.value)
}

// 暴露 submit 方法和 isLoading 状态供父组件调用
defineExpose({
  submit,
  isLoading,
})
</script>

<template>
  <div v-if="!dept" class="text-center text-gray-500 py-8">
    加载中...
  </div>

  <form v-else class="space-y-4" @submit.prevent>
    <!-- 部门名称输入框 -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        部门名称 <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        placeholder="请输入部门名称"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.name ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
      <div v-if="errors.name" class="mt-1 text-sm text-red-600">
        {{ errors.name }}
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </form>
</template>
