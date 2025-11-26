<script setup lang="ts">
import type { Dept } from '~/types/management'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

const { showToast } = useToast()

// 表单验证 schema
const addDeptSchema = z.object({
  name: z.string().min(1, '部门名称不能为空'),
})

type AddDeptForm = z.infer<typeof addDeptSchema>

// 表单数据
const formData = ref<AddDeptForm>({
  name: '',
})

// 表单验证
const { errors, validate } = useForm(addDeptSchema)

// 调用创建部门 API
const { error, data, execute: createDept } = useWeilaFetch<{ dept: Dept }>('/corp/address/create-dept', {
  immediate: false,
}).post(() => ({
  name: formData.value.name,
})).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 主要提交方法 - 暴露给父组件
async function submit(): Promise<false | { dept: Dept }> {
  if (!validate(formData.value)) {
    return false
  }

  try {
    await createDept()

    if (error.value) {
      showToast(error.value.message || '部门创建失败')
      return false
    }

    if (data.value) {
      showToast('部门创建成功')
      return data.value
    }

    return false
  }
  catch (err) {
    console.error('部门创建失败:', err)
    showToast('部门创建失败')
    return false
  }
}

// 重置表单
function reset() {
  formData.value = {
    name: '',
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
      >
      <div v-if="errors.name" class="mt-1 text-sm text-red-600">
        {{ errors.name }}
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>
