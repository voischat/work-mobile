<script setup lang="ts">
import type { BindPhoneRequest, SendSmsVerifyCodeRequest } from '~/types/auth'
import { Icon } from '@iconify/vue'
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

const bindPhoneSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, t('me.validation.phoneInvalid')),
  imageVerifyAnswer: z.string().min(1, t('auth.validation.imageVerifyCodeRequired')),
  verifycode: z.string().min(4, t('me.validation.verifyCodeMin')),
})

  type BindPhoneForm = z.infer<typeof bindPhoneSchema>

const formData = ref<BindPhoneForm>({
  phone: '',
  imageVerifyAnswer: '',
  verifycode: '',
})

const imageVerifyCodeRef = ref<InstanceType<typeof ImageVerifyCode> | null>(null)
const countDownButtonRef = ref<InstanceType<typeof CountDownButton> | null>(null)

const { errors, validate } = useForm(bindPhoneSchema)

const { mutate: sendSmsVerifyCode, isLoading: isSendingSms } = useMutation({
  mutation: (params: SendSmsVerifyCodeRequest) =>
    weilaFetch('/common/send-sms-verifycode', {
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

const { mutate: bindPhone, isLoading, error } = useMutation({
  mutation: (params: BindPhoneRequest) =>
    weilaFetch('/corp/user/bind-phone', {
      method: 'POST',
      body: params,
    }),
  onSuccess() {
    showToast(t('me.bindPhone.bindSuccess'))
    router.back()
  },
  onError(error) {
    showToast(error.message || t('me.bindPhone.bindFailed'))
  },
})

const errorMessage = computed(() => {
  return error.value?.message || ''
})

async function handleSendSmsVerifyCode() {
  if (!formData.value.phone || !/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    showToast(t('auth.validation.phoneInvalid'))
    return
  }

  if (!formData.value.imageVerifyAnswer) {
    showToast(t('auth.validation.imageVerifyCodeRequired'))
    return
  }

  sendSmsVerifyCode({
    phone: formData.value.phone,
    countrycode: '86',
    verify_id: imageVerifyCodeRef.value?.verifyId || '',
    verify_answer: formData.value.imageVerifyAnswer,
    smstype: 'work-bind-phone',
  })
}

const canSendSms = computed(() => {
  const hasPhone = !!formData.value.phone
  const isPhoneValid = /^1[3-9]\d{9}$/.test(formData.value.phone)
  const hasImageVerify = !!formData.value.imageVerifyAnswer
  const notSending = !isSendingSms.value

  console.log('canSendSms check:', {
    hasPhone,
    phone: formData.value.phone,
    isPhoneValid,
    hasImageVerify,
    imageVerifyAnswer: formData.value.imageVerifyAnswer,
    notSending,
  })

  return hasPhone && isPhoneValid && hasImageVerify && notSending
})

function handleSubmit() {
  if (!validate(formData.value)) {
    showToast(Object.values(errors.value)?.[0] || t('common.validation.validationFailed'))
    return
  }
  bindPhone({
    phone: formData.value.phone,
    country_code: '86',
    verifycode: formData.value.verifycode,
  })
}
</script>

<template>
  <BackLayout title="绑定手机">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '我的', route: '/me' },
          { name: '绑定手机' },
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- 手机号输入框（带国家代码） -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('me.bindPhone.phone') }}
              </label>
              <div class="flex items-center">
                <div class="flex items-center px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  <span class="text-gray-700">{{ t('auth.tips.phonePrefix') }}</span>
                  <Icon icon="lucide:chevron-down" class="w-4 h-4 text-gray-400 ml-1" />
                </div>
                <input
                  id="phone"
                  v-model="formData.phone"
                  type="tel"
                  :placeholder="t('auth.placeholders.phone')"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="errors.phone ? 'border-red-500' : 'border-gray-300'"
                  :disabled="isLoading"
                >
              </div>
              <div v-if="errors.phone" class="mt-1 text-sm text-red-600">
                {{ errors.phone }}
              </div>
            </div>

            <!-- 图形验证码 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('me.bindPhone.imageVerifyCode') }}
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
                {{ t('me.bindPhone.refreshHint') }}
              </p>
            </div>

            <!-- 短信验证码输入框 -->
            <div>
              <label for="verifycode" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('me.bindPhone.smsVerifyCode') }}
              </label>
              <div class="flex items-center space-x-2">
                <input
                  id="verifycode"
                  v-model="formData.verifycode"
                  type="text"
                  :placeholder="t('auth.placeholders.smsVerifyCode')"
                  class="flex-1 min-w-0 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="errors.verifycode ? 'border-red-500' : 'border-gray-300'"
                  :disabled="isLoading"
                >
                <CountDownButton
                  ref="countDownButtonRef"
                  class="flex-shrink-0"
                  :disabled="!canSendSms"
                  :loading="isSendingSms"
                  storage-key="send-sms-time"
                  :countdown-seconds="60"
                  :loading-text="t('auth.actions.sending')"
                  :default-text="t('auth.actions.sendVerifyCode')"
                  @click="handleSendSmsVerifyCode"
                />
              </div>
              <div v-if="errors.verifycode" class="mt-1 text-sm text-red-600">
                {{ errors.verifycode }}
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ t('me.bindPhone.sendHint') }}
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
                @click="router.back()"
              >
                {{ t('me.bindPhone.cancel') }}
              </button>
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
              >
                {{ isLoading ? t('me.bindPhone.submitting') : t('me.bindPhone.confirmSubmit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
