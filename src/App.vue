<script setup lang="ts">
import type { LoginResponse } from '~/types/auth'
import { useMutation } from '@pinia/colada'
import { useRouteQuery } from '@vueuse/router'
import { globalModalCancelCallback, globalModalConfirmCallback, globalModalProps, isGlobalModalVisible } from './composables/useModal'
import { isLimitedWebview } from './shared/const'
import { weilaFetch } from './shared/instances'

const { showToast } = useToast()

const REFRESH_INTERVAL = 3 * 60 * 1000 // 3分钟
const { token, refreshToken, clearAuth, saveAuth } = useAuth()

// 从 URL query 获取账号与加密密码
const queryAccount = useRouteQuery('account', '')
const queryPassword = useRouteQuery('password', '')
const queryCountryCode = useRouteQuery('country-code', '')

const router = useRouter()

// 登录 mutation
const { mutate: login } = useMutation({
  mutation: (params: { country_code: string, account: string, password: string }) =>
    weilaFetch<LoginResponse>('/corp/auth/login', {
      method: 'POST',
      body: params,
    }),
  onSuccess(data) {
    saveAuth(data.access_token, data.refresh_token, data.expires_in)
    isLimitedWebview.value = true
    router.replace('/login')
  },
  onError(error) {
    showToast(error.message)
    clearAuth()
    isLimitedWebview.value = false
    router.replace('/login')
  },
})

// 刷新 token mutation
const { mutate: refreshTokenMutate } = useMutation({
  mutation: (params: { refresh_token: string }) =>
    weilaFetch<{
      access_token: string
      expires_in: number
      refresh_token: string
    }>('/corp/auth/refresh', {
      method: 'POST',
      body: params,
    }),
  onSuccess(data) {
    saveAuth(data.access_token, data.refresh_token, data.expires_in)
  },
  onError() {
    clearAuth()
  },
})

// 监听 URL query 参数，自动登录
watch([queryAccount, queryPassword], ([account, password]) => {
  if (account && password) {
    isLimitedWebview.value = true
    login({
      country_code: queryCountryCode.value,
      account,
      password,
    })
  }
}, { immediate: true })

// 刷新 token 的函数
function refreshAccessToken() {
  if (refreshToken.value) {
    refreshTokenMutate({
      refresh_token: refreshToken.value,
    })
  }
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

const { currentTitle } = useBreadcrumb()
useTitle(computed(() => currentTitle.value ? `${currentTitle.value} - VoisWork` : 'VoisWork'))
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
