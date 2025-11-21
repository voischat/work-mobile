<script setup lang="ts">
import type { LoginResponse } from '~/types/auth'
import { useRouteQuery } from '@vueuse/router'

const { showToast } = useToast()

const REFRESH_INTERVAL = 3 * 60 * 1000 // 3分钟
const { token, refreshToken, clearAuth, saveAuth } = useAuth()

// 从 URL query 获取账号与加密密码
const queryAccount = useRouteQuery('account', '')
const queryPassword = useRouteQuery('password', '')

// 登录 fetch（非立即执行）
const {
  data: loginData,
  error: loginError,
  execute: loginExecute,
} = useWeilaFetch<LoginResponse>('/corp/auth/login', {
  immediate: false,
}).post(() => ({
  account: queryAccount.value,
  password: queryPassword.value,
})).json()

// 刷新 token 的 fetch（非立即执行）
const {
  data: refreshData,
  error: refreshError,
  execute: refreshTokenExecute,
} = useWeilaFetch<{
  access_token: string
  expires_in: number
  refresh_token: string
}>('/corp/auth/refresh', {
  immediate: false,
}).post(() => ({
  refresh_token: refreshToken.value!,
})).json()

// 监听 URL 账号密码，触发一次登录
const stopLoginWatcher = watch([queryAccount, queryPassword], ([account, password]) => {
  if (account && password) {
    loginExecute()
    stopLoginWatcher()
  }
}, { immediate: true })

// 监听登录结果
const stopLoginResultWatcher = watch([loginData, loginError], () => {
  if (loginError.value) {
    showToast(loginError.value.message)
    clearAuth()
    stopLoginResultWatcher()
    return
  }
  if (loginData.value) {
    saveAuth(loginData.value.access_token, loginData.value.refresh_token)
    stopLoginResultWatcher()
  }
})

// 监听刷新结果
watch([refreshData, refreshError], () => {
  if (refreshError.value) {
    clearAuth()
    return
  }
  if (refreshData.value) {
    saveAuth(refreshData.value.access_token, refreshData.value.refresh_token)
  }
})

// 刷新 token 的函数
function refreshAccessToken() {
  if (refreshToken.value)
    refreshTokenExecute()
}

// 使用 useIntervalFn 每 3 分钟刷新一次 token
const { pause, resume } = useIntervalFn(refreshAccessToken, REFRESH_INTERVAL, { immediate: false })

// 根据 token 状态控制定时器
watch([token, refreshToken], ([t, rt]) => {
  if (t && rt)
    resume()
  else
    pause()
}, { immediate: true })

// Toast
const { toasts, removeToast } = useToast()
</script>

<template>
  <main>
    <RouterView />
    <Toast :toasts="toasts" @remove="removeToast" />
  </main>
</template>
