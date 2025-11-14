<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'

const REFRESH_INTERVAL = 3 * 60 * 1000 // 3分钟
const { token, refreshToken, clearAuth, saveAuth } = useAuth()

// 从 URL query 获取 token 和 refresh_token
const queryToken = useRouteQuery('token', '')
const queryRefreshToken = useRouteQuery('refresh_token', '')

// 监听 URL query 中的 token，如果两者都存在则保存
const { stop } = watch([queryToken, queryRefreshToken], ([tokenValue, refreshTokenValue]) => {
  if (tokenValue && refreshTokenValue) {
    saveAuth(tokenValue, refreshTokenValue)
    stop()
  }
}, { immediate: true })

// 刷新 token 的 fetch（非立即执行）
const { data, error, execute: refreshTokenExecute } = useWeilaFetch<{
  access_token: string
  expires_in: number
  refresh_token: string
}>('/corp/auth/refresh', {
  immediate: false,
}).post(() => ({
  refresh_token: refreshToken.value!,
})).json()

// 监听刷新结果
watch([data, error], () => {
  if (error.value) {
    clearAuth()
    return
  }
  if (data.value) {
    saveAuth(data.value.access_token, data.value.refresh_token)
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
