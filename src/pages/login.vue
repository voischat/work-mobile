<script setup lang="ts">
import type { LoginResponse } from '~/types/auth'
import { useMutation } from '@pinia/colada'
import md5 from 'md5'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useAuth } from '~/composables/useAuth'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const loginSchema = z.object({
  account: z.string().min(1, '账号不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

type LoginForm = z.infer<typeof loginSchema>

const router = useRouter()
const { saveAuth } = useAuth()
const { showToast } = useToast()

const formData = ref<LoginForm>({
  account: '19225302194',
  password: '123456',
})

const { errors, validate } = useForm(loginSchema)

const { mutate: login, isLoading: isFetching } = useMutation({
  mutation: () => weilaFetch<LoginResponse>('/corp/auth/login', {
    method: 'POST',
    body: {
      account: formData.value.account,
      password: md5(formData.value.password),
    },
  }),
  onSuccess(loginData) {
    showToast('登录成功')
    saveAuth(loginData.access_token, loginData.refresh_token, loginData.expires_in)
    router.push('/')
  },
  onError(error) {
    showToast(error.message || '登录失败')
  },
})

function handleLogin() {
  if (!validate(formData.value)) {
    showToast(Object.values(errors.value)?.[0] || '表单验证失败')
    return
  }
  login()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          登录
        </h1>

        <form class="space-y-4" @submit.prevent="() => handleLogin()">
          <!-- 账号输入框 -->
          <div>
            <label for="account" class="block text-sm font-medium text-gray-700 mb-1">
              账号
            </label>
            <input
              id="account"
              v-model="formData.account"
              type="text"
              placeholder="请输入账号"
              class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="errors.account ? 'border-red-500' : 'border-gray-300'"
              :disabled="isFetching"
            >
            <div v-if="errors.account" class="mt-1 text-sm text-red-600">
              {{ errors.account }}
            </div>
          </div>

          <!-- 密码输入框 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="errors.password ? 'border-red-500' : 'border-gray-300'"
              :disabled="isFetching"
            >
            <div v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </div>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="isFetching"
          >
            {{ isFetching ? '登录中...' : '登录' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
