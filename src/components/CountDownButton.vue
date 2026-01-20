<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  disabled?: boolean
  loading?: boolean
  storageKey?: string
  countdownSeconds?: number
  loadingText?: string
  defaultText?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
  storageKey: 'countdown-time',
  countdownSeconds: 60,
  loadingText: undefined,
  defaultText: undefined,
})

const { t } = useI18n()

const countdownTime = useLocalStorage(props.storageKey, 0)
const countdown = ref<number>(0)
const countdownTimer = ref<number | null>(null)

// 是否可以点击
const canClick = computed(() => {
  return countdown.value === 0 && !props.disabled && !props.loading
})

// 按钮文本
const buttonText = computed(() => {
  if (countdown.value > 0)
    return t('auth.actions.countdownSeconds', { seconds: countdown.value })
  if (props.loading)
    return props.loadingText ?? t('auth.actions.sending')
  return props.defaultText ?? t('auth.actions.sendVerifyCode')
})

// 初始化倒计时
function initCountdown() {
  if (countdownTime.value > Date.now()) {
    // 如果还有剩余时间，继续倒计时
    const remaining = Math.floor((countdownTime.value - Date.now()) / 1000)
    countdown.value = remaining
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value)
    }
    countdownTimer.value = window.setInterval(() => {
      const remaining = Math.max(0, Math.floor((countdownTime.value - Date.now()) / 1000))
      countdown.value = remaining
      if (remaining <= 0) {
        if (countdownTimer.value) {
          clearInterval(countdownTimer.value)
          countdownTimer.value = null
        }
        countdownTime.value = 0
      }
    }, 1000)
  }
  else {
    // 如果时间已过，重置
    countdownTime.value = 0
    countdown.value = 0
  }
}

// 开始倒计时
function startCountdown() {
  const now = Date.now()
  countdownTime.value = now + props.countdownSeconds * 1000
  countdown.value = props.countdownSeconds
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
  countdownTimer.value = window.setInterval(() => {
    const remaining = Math.max(0, Math.floor((countdownTime.value - Date.now()) / 1000))
    countdown.value = remaining
    if (remaining <= 0) {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
        countdownTimer.value = null
      }
      countdownTime.value = 0
    }
  }, 1000)
}

// 处理点击
function handleClick() {
  if (!canClick.value)
    return
  emit('click')
  // 不在这里自动开始倒计时，由父组件在操作成功后调用 startCountdown
}

// 页面加载时初始化倒计时
onMounted(() => {
  initCountdown()
})

// 清理定时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
})

// 暴露方法供外部调用（例如操作成功后调用）
defineExpose({
  startCountdown,
})
</script>

<template>
  <button
    type="button"
    class="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
    :disabled="!canClick"
    @click="handleClick"
  >
    {{ buttonText }}
  </button>
</template>
