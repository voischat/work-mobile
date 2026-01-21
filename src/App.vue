<script setup lang="ts">
import { useMutation } from '@pinia/colada'
import { useLocale } from './composables/useLocale'
import { globalModalCancelCallback, globalModalConfirmCallback, globalModalProps, isGlobalModalVisible } from './composables/useModal'

useLocale()

const REFRESH_INTERVAL = 3 * 60 * 1000
const { token, refreshToken, clearAuth, saveAuth } = useAuth()

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
  onSuccess(data: { access_token: string, expires_in: number, refresh_token: string }) {
    saveAuth(data.access_token, data.refresh_token, data.expires_in)
  },
  onError() {
    clearAuth()
  },
})

function refreshAccessToken() {
  if (refreshToken.value) {
    refreshTokenMutate({
      refresh_token: refreshToken.value,
    })
  }
}

const { pause, resume } = useIntervalFn(refreshAccessToken, REFRESH_INTERVAL, { immediate: false })

watch([token, refreshToken], ([t, rt]) => {
  if (t && rt)
    resume()
  else
    pause()
}, { immediate: true })

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
