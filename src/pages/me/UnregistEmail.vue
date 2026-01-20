<script setup lang="ts">
import type { SendEmailVerifyCodeRequest, UnregistByEmailRequest } from '~/types/auth'
import { useMutation } from '@pinia/colada'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import CountDownButton from '~/components/CountDownButton.vue'
import ImageVerifyCode from '~/components/ImageVerifyCode.vue'
import { useAuth } from '~/composables/useAuth'
import { useForm } from '~/composables/useForm'
import { useModal } from '~/composables/useModal'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const unregistEmailSchema = z.object({
  email: z.string().email('me.validation.emailInvalid'),
  imageVerifyAnswer: z.string().min(1, 'auth.validation.imageVerifyCodeRequired'),
  verifycode: z.string().min(4, 'me.validation.verifyCodeMin'),
})

type UnregistEmailForm = z.infer<typeof unregistEmailSchema>

const router = useRouter()
const { clearAuth } = useAuth()
const { showToast } = useToast()
const { showModal } = useModal()
const { t } = useI18n()

const formData = ref<UnregistEmailForm>({
  email: '',
  imageVerifyAnswer: '',
  verifycode: '',
})

const imageVerifyCodeRef = ref<InstanceType<typeof ImageVerifyCode> | null>(null)
const countDownButtonRef = ref<InstanceType<typeof CountDownButton> | null>(null)

const { errors, validate } = useForm(unregistEmailSchema)

const { mutate: sendEmailVerifyCode, isLoading: isSendingEmail } = useMutation({
  mutation: (params: SendEmailVerifyCodeRequest) =>
    weilaFetch('/common/send-email-verifycode', {
      method: 'POST',
      body: params,
    }),
  onSuccess() {
    showToast('验证码已发送')
    countDownButtonRef.value?.startCountdown()
  },
  onError(error) {
    showToast(error.message || '发送验证码失败')
    imageVerifyCodeRef.value?.refresh()
  },
})

const { mutate: unregistByEmail, isLoading, error } = useMutation({
  mutation: (params: UnregistByEmailRequest) =>
    weilaFetch('/corp/user/unregist-by-email', {
      method: 'POST',
      body: params,
    }),
  onSuccess() {
    showToast('账号注销成功')
    clearAuth()
    router.push('/login')
  },
  onError(error) {
    showToast(error.message || '注销失败')
  },
})

const errorMessage = computed(() => {
  return error.value?.message || ''
})

function handleSendEmailVerifyCode() {
  const emailRegex = /^[\w.-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  if (!formData.value.email || !emailRegex.test(formData.value.email)) {
    showToast('请输入正确的邮箱地址')
    return
  }

  if (!formData.value.imageVerifyAnswer) {
    showToast('请输入图形验证码')
    return
  }

  sendEmailVerifyCode({
    email: formData.value.email,
    verify_id: imageVerifyCodeRef.value?.verifyId || '',
    verify_answer: formData.value.imageVerifyAnswer,
    smstype: 'work-unregist',
  })
}

const canSendEmail = computed(() => {
  const emailRegex = /^[\w.-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  return formData.value.email
    && emailRegex.test(formData.value.email)
    && formData.value.imageVerifyAnswer
    && !isSendingEmail.value
})

async function handleSubmit() {
  if (!validate(formData.value)) {
    showToast(Object.values(errors.value)?.[0] || '表单验证失败')
    return
  }

  await showModal({
    title: '确认注销',
    message: '确定要注销账号吗？此操作不可恢复！',
    confirmText: '确认注销',
    cancelText: '取消',
    confirmButtonType: 'danger',
    onConfirm() {
      unregistByEmail({
        email: formData.value.email,
        country_code: '86',
        verifycode: formData.value.verifycode,
      })
    },
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <!-- 邮箱输入框 -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('me.unregisterEmail.email') }}
      </label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        :placeholder="t('auth.placeholders.email')"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.email ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
      <div v-if="errors.email" class="mt-1 text-sm text-red-600">
        {{ errors.email }}
      </div>
    </div>

    <!-- 图形验证码 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('me.unregisterEmail.imageVerifyCode') }}
      </label>
      <ImageVerifyCode
        ref="imageVerifyCodeRef"
        v-model="formData.imageVerifyAnswer"
        :width="120"
        :height="60"
        :disabled="isLoading"
        :error="!!errors.imageVerifyAnswer"
      />
      <div v-if="errors.imageVerifyAnswer" class="mt-1 text-sm text-red-600">
        {{ errors.imageVerifyAnswer }}
      </div>
      <p class="mt-1 text-xs text-gray-500">
        {{ t('me.unregisterEmail.refreshHint') }}
      </p>
    </div>

    <!-- 邮箱验证码输入框 -->
    <div>
      <label for="verifycode" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('me.unregisterEmail.emailVerifyCode') }}
      </label>
      <div class="flex items-center space-x-2">
        <input
          id="verifycode"
          v-model="formData.verifycode"
          type="text"
          :placeholder="t('auth.placeholders.emailVerifyCode')"
          class="flex-1 min-w-0 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="errors.verifycode ? 'border-red-500' : 'border-gray-300'"
          :disabled="isLoading"
        >
        <CountDownButton
          ref="countDownButtonRef"
          class="flex-shrink-0"
          :disabled="!canSendEmail"
          :loading="isSendingEmail"
          storage-key="send-email-unregist-time"
          :countdown-seconds="60"
          :loading-text="t('auth.actions.sending')"
          :default-text="t('auth.actions.sendVerifyCode')"
          @click="handleSendEmailVerifyCode"
        />
      </div>
      <div v-if="errors.verifycode" class="mt-1 text-sm text-red-600">
        {{ errors.verifycode }}
      </div>
      <p class="mt-1 text-xs text-gray-500">
        {{ t('me.unregisterEmail.sendHint') }}
      </p>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>

    <!-- 按钮组 -->
    <div class="flex space-x-3 pt-4">
      <button
        type="button"
        class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :disabled="isLoading"
        @click="router.push('/me')"
      >
        {{ t('me.unregisterEmail.cancel') }}
      </button>
      <button
        type="submit"
        class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :disabled="isLoading"
      >
        {{ isLoading ? t('me.unregisterEmail.submitting') : t('me.unregisterEmail.confirmSubmit') }}
      </button>
    </div>
  </form>
</template>
