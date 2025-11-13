<script setup lang="ts">
import type { LoginResponse } from '~/types/auth'
import md5 from 'md5'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { saveAuth } from '~/composables/useAuth'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 表单验证 schema
const loginSchema = z.object({
  account: z.string().min(1, '账号不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

type LoginForm = z.infer<typeof loginSchema>

const router = useRouter()

// 表单数据
const formData = ref<LoginForm>({
  account: '',
  password: '',
})

// 调用登录 API（非立即执行）
const { error, isFetching, data, execute: login } = useWeilaFetch<LoginResponse>('/corp/auth/login', {
  immediate: false,
}).post(() => ({
  account: formData.value.account,
  password: md5(formData.value.password),
})).json()

const errorMessage = computed(() => {
  return error.value?.message || '登录失败，请稍后重试'
})

// 监听登录成功
watch(data, (loginData) => {
  if (loginData) {
    // 保存 token 到 localStorage
    saveAuth(loginData.access_token, loginData.refresh_token)
    // 登录成功后跳转到首页
    router.push('/')
  }
})

function handleLogin() {
  const result = loginSchema.safeParse(formData.value)
  if (!result.success) {
    // 这里只做简单弹窗，可根据需求替换为更复杂的表单错误展示
    alert(result.error.issues[0].message)
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
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :disabled="isFetching"
            >
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
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :disabled="isFetching"
            >
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="text-sm text-red-600">
            {{ errorMessage }}
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
