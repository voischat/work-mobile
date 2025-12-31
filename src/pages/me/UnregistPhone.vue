<script setup lang="ts">
import type { SendSmsVerifyCodeRequest, UnregistRequest } from '~/types/auth'
import { Icon } from '@iconify/vue'
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

const unregistPhoneSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  imageVerifyAnswer: z.string().min(1, '请输入图形验证码'),
  verifycode: z.string().min(4, '验证码至少4位'),
})

type UnregistPhoneForm = z.infer<typeof unregistPhoneSchema>

const router = useRouter()
const { clearAuth } = useAuth()
const { showToast } = useToast()
const { showModal } = useModal()

const formData = ref<UnregistPhoneForm>({
  phone: '',
  imageVerifyAnswer: '',
  verifycode: '',
})

const imageVerifyCodeRef = ref<InstanceType<typeof ImageVerifyCode> | null>(null)
const countDownButtonRef = ref<InstanceType<typeof CountDownButton> | null>(null)

const { errors, validate } = useForm(unregistPhoneSchema)

const { mutate: sendSmsVerifyCode, isLoading: isSendingSms } = useMutation({
  mutation: (params: SendSmsVerifyCodeRequest) =>
    weilaFetch('/common/send-sms-verifycode', {
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

const { mutate: unregistByPhone, isLoading, error } = useMutation({
  mutation: (params: UnregistRequest) =>
    weilaFetch('/corp/user/unregist', {
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

function handleSendSmsVerifyCode() {
  if (!formData.value.phone || !/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    showToast('请输入正确的手机号')
    return
  }

  if (!formData.value.imageVerifyAnswer) {
    showToast('请输入图形验证码')
    return
  }

  sendSmsVerifyCode({
    phone: formData.value.phone,
    countrycode: '86',
    verify_id: imageVerifyCodeRef.value?.verifyId || '',
    verify_answer: formData.value.imageVerifyAnswer,
    smstype: 'work-unregist',
  })
}

const canSendSms = computed(() => {
  return formData.value.phone
    && /^1[3-9]\d{9}$/.test(formData.value.phone)
    && formData.value.imageVerifyAnswer
    && !isSendingSms.value
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
      unregistByPhone({
        phone: formData.value.phone,
        country_code: '86',
        verifycode: formData.value.verifycode,
      })
    },
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <!-- 手机号输入框（带国家代码） -->
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
        手机号
      </label>
      <div class="flex items-center">
        <div class="flex items-center px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
          <span class="text-gray-700">+86</span>
          <Icon icon="lucide:chevron-down" class="w-4 h-4 text-gray-400 ml-1" />
        </div>
        <input
          id="phone"
          v-model="formData.phone"
          type="tel"
          placeholder="请输入手机号"
          class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        图形验证码
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
        点击图片可刷新验证码
      </p>
    </div>

    <!-- 短信验证码输入框 -->
    <div>
      <label for="verifycode" class="block text-sm font-medium text-gray-700 mb-1">
        短信验证码
      </label>
      <div class="flex items-center space-x-2">
        <input
          id="verifycode"
          v-model="formData.verifycode"
          type="text"
          placeholder="请输入短信验证码"
          class="flex-1 min-w-0 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="errors.verifycode ? 'border-red-500' : 'border-gray-300'"
          :disabled="isLoading"
        >
        <CountDownButton
          ref="countDownButtonRef"
          class="flex-shrink-0"
          :disabled="!canSendSms"
          :loading="isSendingSms"
          storage-key="send-sms-unregist-time"
          :countdown-seconds="60"
          loading-text="发送中..."
          default-text="发送验证码"
          @click="handleSendSmsVerifyCode"
        />
      </div>
      <div v-if="errors.verifycode" class="mt-1 text-sm text-red-600">
        {{ errors.verifycode }}
      </div>
      <p class="mt-1 text-xs text-gray-500">
        请先输入图形验证码，然后点击发送验证码
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
        取消
      </button>
      <button
        type="submit"
        class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :disabled="isLoading"
      >
        {{ isLoading ? '注销中...' : '确认注销' }}
      </button>
    </div>
  </form>
</template>
