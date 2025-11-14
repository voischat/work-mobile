<script setup lang="ts">
import type { UnregistByEmailRequest } from '~/types/auth'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useAuth } from '~/composables/useAuth'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 邮箱注销表单验证 schema
const unregistEmailSchema = z.object({
  email: z.string().email('请输入正确的邮箱地址'),
  country_code: z.string().min(1, '国家代码不能为空'),
  verifycode: z.string().min(4, '验证码至少4位'),
})

type UnregistEmailForm = z.infer<typeof unregistEmailSchema>

const router = useRouter()
const { clearAuth } = useAuth()
const { showToast } = useToast()

// 表单数据
const formData = ref<UnregistEmailForm>({
  email: '',
  country_code: '86',
  verifycode: '',
})

// 表单验证 - 可以解构
const { errors, validate } = useForm(unregistEmailSchema)

// 调用注销账号 API（邮箱）
const {
  error,
  isFetching,
  isFinished,
  data,
  execute: unregistByEmail,
} = useWeilaFetch('/corp/user/unregist-by-email', {
  immediate: false,
}).post(() => ({
  email: formData.value.email,
  country_code: formData.value.country_code,
  verifycode: formData.value.verifycode,
} as UnregistByEmailRequest)).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 监听注销成功
watch([data, isFinished, error], ([result, finished, err]) => {
  if (!finished)
    return
  if (err)
    return
  if (result !== undefined) {
    showToast('账号注销成功')
    clearAuth()
    router.push('/login')
  }
})

function handleSubmit() {
  if (!validate(formData.value)) {
    return
  }
  if (!confirm('确定要注销账号吗？此操作不可恢复！')) {
    return
  }
  unregistByEmail()
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        邮箱
      </label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        placeholder="请输入邮箱地址"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.email ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
      <div v-if="errors.email" class="mt-1 text-sm text-red-600">
        {{ errors.email }}
      </div>
    </div>

    <div>
      <label for="email_country_code" class="block text-sm font-medium text-gray-700 mb-1">
        国家代码
      </label>
      <input
        id="email_country_code"
        v-model="formData.country_code"
        type="text"
        placeholder="请输入国家代码（如：86）"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.country_code ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
      <div v-if="errors.country_code" class="mt-1 text-sm text-red-600">
        {{ errors.country_code }}
      </div>
    </div>

    <div>
      <label for="email_verifycode" class="block text-sm font-medium text-gray-700 mb-1">
        验证码
      </label>
      <input
        id="email_verifycode"
        v-model="formData.verifycode"
        type="text"
        placeholder="请输入验证码"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.verifycode ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
      <div v-if="errors.verifycode" class="mt-1 text-sm text-red-600">
        {{ errors.verifycode }}
      </div>
    </div>

    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>

    <div class="flex space-x-3 pt-4">
      <button
        type="button"
        class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :disabled="isFetching"
        @click="router.push('/me')"
      >
        取消
      </button>
      <button
        type="submit"
        class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :disabled="isFetching"
      >
        {{ isFetching ? '注销中...' : '确认注销' }}
      </button>
    </div>
  </form>
</template>
