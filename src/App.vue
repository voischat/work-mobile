<script setup lang="ts">
import FeatureFlagsDevTools from './components/FeatureFlagsDevTools.vue'
import { useAppName } from './composables/useAppName'
import { useLocale } from './composables/useLocale'
import { globalModalCancelCallback, globalModalConfirmCallback, globalModalProps, isGlobalModalVisible } from './composables/useModal'
import { savedLocale } from './shared/states'

useLocale()

const { appName } = useAppName()
const isDev = import.meta.env.DEV

const { toasts, removeToast } = useToast()

const mainComp = useTemplateRef<any>('mainComp')
watchEffect(() => {
  console.log('mainComp.value', mainComp.value)
})

const { currentTitle } = useBreadcrumb()
useTitle(computed(() => currentTitle.value ? `${currentTitle.value} - ${appName.value}` : appName.value))

const { locale } = useLocale()
watch(savedLocale, (newValue) => {
  locale.value = newValue
}, { immediate: true })

const { isEnabled } = useFeatureFlags()

watch(() => isEnabled('languageSwitching'), (value) => {
  if (!value)
    savedLocale.value = 'zh-CN'
}, { immediate: true })
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
        <img src="/logo.png" :alt="appName" class="w-24 h-24">
        <div class="text-2xl font-semibold text-gray-800">
          {{ appName }}
        </div>
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </LoadingOverlay>
    <FeatureFlagsDevTools v-if="isDev" />
  </main>
</template>
