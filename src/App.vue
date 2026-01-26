<script setup lang="ts">
import { useMutation } from '@pinia/colada'
import { useI18n } from 'vue-i18n'
import { useLocale } from './composables/useLocale'
import { globalModalCancelCallback, globalModalConfirmCallback, globalModalProps, isGlobalModalVisible } from './composables/useModal'

const { t } = useI18n()
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
useTitle(computed(() => currentTitle.value ? `${currentTitle.value} - ${t('app.name')}` : t('app.name')))
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
    <LoadingOverlay>
      <div class="flex flex-col items-center space-y-6">
        <img src="/logo.png" :alt="t('app.name')" class="w-24 h-24">
        <div class="text-2xl font-semibold text-gray-800">
          {{ t('app.name') }}
        </div>
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </LoadingOverlay>
  </main>
</template>
