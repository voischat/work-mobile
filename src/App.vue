<script setup lang="ts">
import type { LoginResponse } from '~/types/auth'
import { useRouteQuery } from '@vueuse/router'
import { globalModalCancelCallback, globalModalConfirmCallback, globalModalProps, isGlobalModalVisible } from './composables/useModal'
import { isLimitedWebview } from './shared/const'

const { showToast } = useToast()

const REFRESH_INTERVAL = 3 * 60 * 1000 // 3分钟
const { token, refreshToken, clearAuth, saveAuth } = useAuth()

// 从 URL query 获取账号与加密密码
const queryAccount = useRouteQuery('account', '')
const queryPassword = useRouteQuery('password', '')
const queryCountryCode = useRouteQuery('country-code', '')

// 登录 fetch（非立即执行）
const {
  data: loginData,
  error: loginError,
  execute: loginExecute,
} = useWeilaFetch<LoginResponse>('/corp/auth/login', {
  immediate: false,
}).post(() => ({
  country_code: queryCountryCode.value,
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

const router = useRouter()

const stopLoginWatcher = watch([queryAccount, queryPassword], ([account, password]) => {
  if (account && password) {
    stopLoginWatcher()
    isLimitedWebview.value = true
    loginExecute().then(() => {
      isLimitedWebview.value = !loginError.value
      router.replace('/login')
    })
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
    saveAuth(loginData.value.access_token, loginData.value.refresh_token, loginData.value.expires_in)
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
    saveAuth(refreshData.value.access_token, refreshData.value.refresh_token, refreshData.value.expires_in)
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

const mainComp = useTemplateRef<any>('mainComp')
watchEffect(() => {
  console.log('mainComp.value', mainComp.value)
})
</script>

<template>
  <main>
    <RouterView v-slot="{ Component, route }">
      <KeepAlive include=" ">
        <component :is="Component" :key="route.name" ref="mainComp" />
      </KeepAlive>
    </RouterView>
    <Toast :toasts="toasts" @remove="removeToast" />
    <Modal
      v-model:open="isGlobalModalVisible"
      v-bind="globalModalProps"
      :on-confirm="globalModalConfirmCallback"
      :on-cancel="globalModalCancelCallback"
    />
  </main>
</template>
