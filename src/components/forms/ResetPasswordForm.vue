<script setup lang="ts">
import { useMutation } from '@pinia/colada'
import md5 from 'md5'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useForm } from '~/composables/useForm'
import { weilaFetch } from '~/shared/instances'

const props = defineProps<{
  memberId: number
}>()

// 表单验证 schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string().min(6, '确认密码至少6位'),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

// 表单数据
const formData = ref<ResetPasswordForm>({
  password: '',
  confirmPassword: '',
})

// 表单验证
const { errors, validate } = useForm(resetPasswordSchema)

// 调用重置密码 API
const { mutate: resetPassword, isLoading: isFetching, error } = useMutation({
  mutation: (payload: { user_id: number, password: string }) => weilaFetch('/corp/address/reset-member-password', {
    method: 'POST',
    body: payload,
  }),
})

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 提交方法，返回 Promise
async function submit(): Promise<void> {
  if (isFetching.value) {
    return Promise.resolve()
  }

  if (!validate(formData.value)) {
    throw new Error(Object.values(errors.value)?.[0] || '表单验证失败')
  }

  await resetPassword({
    user_id: props.memberId,
    password: md5(formData.value.password),
  })
}

// 重置表单
function reset() {
  formData.value = {
    password: '',
    confirmPassword: '',
  }
}

// 暴露 submit 方法和 isFetching 状态供父组件调用
defineExpose({
  submit,
  reset,
  isFetching,
})
</script>

<template>
  <form class="space-y-4" @submit.prevent>
    <!-- 新密码输入框 -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        新密码 <span class="text-red-500">*</span>
      </label>
      <input
        id="password"
        v-model="formData.password"
        type="password"
        placeholder="请输入新密码（至少6位）"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.password ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
      <div v-if="errors.password" class="mt-1 text-sm text-red-600">
        {{ errors.password }}
      </div>
    </div>

    <!-- 确认密码输入框 -->
    <div>
      <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
        确认密码 <span class="text-red-500">*</span>
      </label>
      <input
        id="confirmPassword"
        v-model="formData.confirmPassword"
        type="password"
        placeholder="请再次输入新密码"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.confirmPassword ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
      <div v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
        {{ errors.confirmPassword }}
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </form>
</template>
