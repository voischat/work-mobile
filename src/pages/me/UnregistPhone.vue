<script setup lang="ts">
import type { UnregistRequest } from '~/types/auth'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useAuth } from '~/composables/useAuth'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 手机注销表单验证 schema
const unregistPhoneSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  country_code: z.string().min(1, '国家代码不能为空'),
  verifycode: z.string().min(4, '验证码至少4位'),
})

type UnregistPhoneForm = z.infer<typeof unregistPhoneSchema>

const router = useRouter()
const { clearAuth } = useAuth()
const { showToast } = useToast()

// 表单数据
const formData = ref<UnregistPhoneForm>({
  phone: '',
  country_code: '86',
  verifycode: '',
})

// 表单验证 - 可以解构
const { errors, validate } = useForm(unregistPhoneSchema)

// 调用注销账号 API（手机）
const {
  error,
  isFetching,
  isFinished,
  data,
  execute: unregistByPhone,
} = useWeilaFetch('/corp/user/unregist', {
  immediate: false,
}).post(() => ({
  phone: formData.value.phone,
  country_code: formData.value.country_code,
  verifycode: formData.value.verifycode,
} as UnregistRequest)).json()

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
  unregistByPhone()
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
        手机号
      </label>
      <input
        id="phone"
        v-model="formData.phone"
        type="tel"
        placeholder="请输入手机号"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.phone ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
      <div v-if="errors.phone" class="mt-1 text-sm text-red-600">
        {{ errors.phone }}
      </div>
    </div>

    <div>
      <label for="phone_country_code" class="block text-sm font-medium text-gray-700 mb-1">
        国家代码
      </label>
      <input
        id="phone_country_code"
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
      <label for="phone_verifycode" class="block text-sm font-medium text-gray-700 mb-1">
        验证码
      </label>
      <input
        id="phone_verifycode"
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
