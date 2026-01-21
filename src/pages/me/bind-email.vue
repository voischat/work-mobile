<script setup lang="ts">
import type { BindEmailRequest, SendEmailVerifyCodeRequest } from '~/types/auth'
import { useMutation } from '@pinia/colada'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import CountDownButton from '~/components/CountDownButton.vue'
import ImageVerifyCode from '~/components/ImageVerifyCode.vue'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const router = useRouter()
const { showToast } = useToast()
const { t } = useI18n()

const bindEmailSchema = z.object({
  email: z.string().email(t('me.validation.emailInvalid')),
  imageVerifyAnswer: z.string().min(1, t('auth.validation.imageVerifyCodeRequired')),
  verifycode: z.string().min(4, t('me.validation.verifyCodeMin')),
})

  type BindEmailForm = z.infer<typeof bindEmailSchema>

const formData = ref<BindEmailForm>({
  email: '',
  imageVerifyAnswer: '',
  verifycode: '',
})

const imageVerifyCodeRef = ref<InstanceType<typeof ImageVerifyCode> | null>(null)
const countDownButtonRef = ref<InstanceType<typeof CountDownButton> | null>(null)

const { errors, validate } = useForm(bindEmailSchema)

const { mutate: sendEmailVerifyCode, isLoading: isSendingEmail } = useMutation({
  mutation: (params: SendEmailVerifyCodeRequest) =>
    weilaFetch('/common/send-email-verifycode', {
      method: 'POST',
      body: params,
    }),
  onSuccess() {
    showToast(t('auth.messages.verifyCodeSent'))
    countDownButtonRef.value?.startCountdown()
  },
  onError(error) {
    showToast(error.message || t('auth.messages.sendVerifyCodeFailed'))
    imageVerifyCodeRef.value?.refresh()
  },
})

const { mutate: bindEmail, isLoading } = useMutation({
  mutation: (params: BindEmailRequest) =>
    weilaFetch('/corp/user/bind-email', {
      method: 'POST',
      body: params,
    }),
  onSuccess() {
    showToast(t('me.bindEmail.bindSuccess'))
    router.push('/me')
  },
  onError(error) {
    showToast(error.message || t('me.bindEmail.bindFailed'))
  },
})

async function handleSendEmailVerifyCode() {
  // 简单的邮箱格式验证
  const emailRegex = /^[\w.-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  if (!formData.value.email || !emailRegex.test(formData.value.email)) {
    showToast(t('auth.validation.emailInvalid'))
    return
  }

  if (!formData.value.imageVerifyAnswer) {
    showToast(t('auth.validation.imageVerifyCodeRequired'))
    return
  }

  sendEmailVerifyCode({
    email: formData.value.email,
    verify_id: imageVerifyCodeRef.value?.verifyId || '',
    verify_answer: formData.value.imageVerifyAnswer,
    smstype: 'work-bind',
  })
}

const canSendEmail = computed(() => {
  const emailRegex = /^[\w.-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  const hasEmail = !!formData.value.email
  const isEmailValid = emailRegex.test(formData.value.email)
  const hasImageVerify = !!formData.value.imageVerifyAnswer
  const notSending = !isSendingEmail.value

  console.log('canSendEmail check:', {
    hasEmail,
    email: formData.value.email,
    isEmailValid,
    hasImageVerify,
    imageVerifyAnswer: formData.value.imageVerifyAnswer,
    notSending,
  })

  return hasEmail && isEmailValid && hasImageVerify && notSending
})

function handleSubmit() {
  if (!validate(formData.value)) {
    showToast(Object.values(errors.value)?.[0] || t('common.validation.validationFailed'))
    return
  }
  bindEmail({
    email: formData.value.email,
    verifycode: formData.value.verifycode,
  })
}
</script>

<template>
  <BackLayout title="绑定邮箱">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: t('nav.me'), route: '/me' },
          { name: t('me.actions.bindEmail') },
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- 邮箱输入框 -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('me.bindEmail.email') }}
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
                {{ t('me.bindEmail.imageVerifyCode') }}
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
                {{ t('me.bindEmail.refreshHint') }}
              </p>
            </div>

            <!-- 邮箱验证码输入框 -->
            <div>
              <label for="verifycode" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('me.bindEmail.emailVerifyCode') }}
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
                  storage-key="send-email-time"
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
                {{ t('me.bindEmail.sendHint') }}
              </p>
            </div>

            <!-- 按钮组 -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
                @click="router.push('/me')"
              >
                {{ t('me.bindEmail.cancel') }}
              </button>
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
              >
                {{ isLoading ? t('me.bindEmail.submitting') : t('me.bindEmail.confirmSubmit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
