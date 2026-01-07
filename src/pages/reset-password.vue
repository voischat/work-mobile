<script setup lang="ts">
import type { ResetPasswordByEmailRequest, ResetPasswordByPhoneRequest, SendEmailVerifyCodeRequest, SendSmsVerifyCodeRequest } from '~/types/auth'
import { Icon } from '@iconify/vue'
import { useMutation } from '@pinia/colada'
import md5 from 'md5'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import CountDownButton from '~/components/CountDownButton.vue'
import ImageVerifyCode from '~/components/ImageVerifyCode.vue'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const phoneSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  imageVerifyAnswer: z.string().min(1, '请输入图形验证码'),
  verifycode: z.string().min(4, '验证码至少4位'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string().min(6, '请确认密码'),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

const emailSchema = z.object({
  email: z.string().email('请输入正确的邮箱地址'),
  imageVerifyAnswer: z.string().min(1, '请输入图形验证码'),
  verifycode: z.string().min(4, '验证码至少4位'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string().min(6, '请确认密码'),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

const router = useRouter()
const { showToast } = useToast()

const phoneForm = ref({ phone: '', imageVerifyAnswer: '', verifycode: '', password: '', confirmPassword: '' })
const emailForm = ref({ email: '', imageVerifyAnswer: '', verifycode: '', password: '', confirmPassword: '' })

const phoneImageVerifyCodeRef = ref<InstanceType<typeof ImageVerifyCode> | null>(null)
const phoneCountDownButtonRef = ref<InstanceType<typeof CountDownButton> | null>(null)
const emailImageVerifyCodeRef = ref<InstanceType<typeof ImageVerifyCode> | null>(null)
const emailCountDownButtonRef = ref<InstanceType<typeof CountDownButton> | null>(null)

const { errors: phoneErrors, validate: validatePhone } = useForm(phoneSchema)
const { errors: emailErrors, validate: validateEmail } = useForm(emailSchema)

function handleResetSuccess() {
  showToast('密码重置成功，请登录')
  router.push('/login')
}

const { mutate: sendSmsVerifyCode, isLoading: isSendingSms } = useMutation({
  mutation: (params: SendSmsVerifyCodeRequest) =>
    weilaFetch('/common/send-sms-verifycode', { method: 'POST', body: params }),
  onSuccess() {
    showToast('验证码已发送')
    phoneCountDownButtonRef.value?.startCountdown()
  },
  onError(error) {
    showToast(error.message || '发送验证码失败')
    phoneImageVerifyCodeRef.value?.refresh()
  },
})

const { mutate: resetPasswordByPhone, isLoading: isPhoneLoading } = useMutation({
  mutation: (params: ResetPasswordByPhoneRequest) =>
    weilaFetch('/corp/auth/reset-password', { method: 'POST', body: params }),
  onSuccess: handleResetSuccess,
  onError: error => showToast(error.message || '重置密码失败'),
})

const { mutate: sendEmailVerifyCode, isLoading: isSendingEmail } = useMutation({
  mutation: (params: SendEmailVerifyCodeRequest) =>
    weilaFetch('/common/send-email-verifycode', { method: 'POST', body: params }),
  onSuccess() {
    showToast('验证码已发送')
    emailCountDownButtonRef.value?.startCountdown()
  },
  onError(error) {
    showToast(error.message || '发送验证码失败')
    emailImageVerifyCodeRef.value?.refresh()
  },
})

const { mutate: resetPasswordByEmail, isLoading: isEmailLoading } = useMutation({
  mutation: (params: ResetPasswordByEmailRequest) =>
    weilaFetch('/corp/auth/reset-password-by-email', { method: 'POST', body: params }),
  onSuccess: handleResetSuccess,
  onError: error => showToast(error.message || '重置密码失败'),
})

const isLoading = computed(() => isPhoneLoading.value || isEmailLoading.value)

const canSendSms = computed(() => {
  return /^1[3-9]\d{9}$/.test(phoneForm.value.phone)
    && !!phoneForm.value.imageVerifyAnswer
    && !isSendingSms.value
})

const canSendEmail = computed(() => {
  const emailRegex = /^[\w.-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  return emailRegex.test(emailForm.value.email)
    && !!emailForm.value.imageVerifyAnswer
    && !isSendingEmail.value
})

function handleSendSmsVerifyCode() {
  if (!phoneForm.value.phone || !/^1[3-9]\d{9}$/.test(phoneForm.value.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  if (!phoneForm.value.imageVerifyAnswer) {
    showToast('请输入图形验证码')
    return
  }
  sendSmsVerifyCode({
    phone: phoneForm.value.phone,
    countrycode: '86',
    verify_id: phoneImageVerifyCodeRef.value?.verifyId || '',
    verify_answer: phoneForm.value.imageVerifyAnswer,
    smstype: 'work-reset-password',
  })
}

function handleSendEmailVerifyCode() {
  const emailRegex = /^[\w.-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  if (!emailForm.value.email || !emailRegex.test(emailForm.value.email)) {
    showToast('请输入正确的邮箱地址')
    return
  }
  if (!emailForm.value.imageVerifyAnswer) {
    showToast('请输入图形验证码')
    return
  }
  sendEmailVerifyCode({
    email: emailForm.value.email,
    verify_id: emailImageVerifyCodeRef.value?.verifyId || '',
    verify_answer: emailForm.value.imageVerifyAnswer,
    smstype: 'work-reset-password',
  })
}

function handlePhoneReset() {
  if (!validatePhone(phoneForm.value)) {
    showToast(Object.values(phoneErrors.value)?.[0] || '表单验证失败')
    return
  }
  resetPasswordByPhone({
    phone: phoneForm.value.phone,
    verifycode: phoneForm.value.verifycode,
    password: md5(phoneForm.value.password),
  })
}

function handleEmailReset() {
  if (!validateEmail(emailForm.value)) {
    showToast(Object.values(emailErrors.value)?.[0] || '表单验证失败')
    return
  }
  resetPasswordByEmail({
    email: emailForm.value.email,
    verifycode: emailForm.value.verifycode,
    password: md5(emailForm.value.password),
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          重置密码
        </h1>

        <TabsRoot default-value="phone">
          <TabsList class="flex border-b border-gray-200 mb-6">
            <TabsTrigger
              value="phone"
              class="flex-1 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              手机号重置
            </TabsTrigger>
            <TabsTrigger
              value="email"
              class="flex-1 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              邮箱重置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phone">
            <form class="space-y-4" @submit.prevent="handlePhoneReset">
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
                    v-model="phoneForm.phone"
                    type="tel"
                    placeholder="请输入手机号"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="phoneErrors.phone ? 'border-red-500' : 'border-gray-300'"
                    :disabled="isLoading"
                  >
                </div>
                <div v-if="phoneErrors.phone" class="mt-1 text-sm text-red-600">
                  {{ phoneErrors.phone }}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  图形验证码
                </label>
                <ImageVerifyCode
                  ref="phoneImageVerifyCodeRef"
                  v-model="phoneForm.imageVerifyAnswer"
                  :width="120"
                  :height="60"
                  :disabled="isLoading"
                  :error="!!phoneErrors.imageVerifyAnswer"
                />
                <div v-if="phoneErrors.imageVerifyAnswer" class="mt-1 text-sm text-red-600">
                  {{ phoneErrors.imageVerifyAnswer }}
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  点击图片可刷新验证码
                </p>
              </div>

              <div>
                <label for="phone-verifycode" class="block text-sm font-medium text-gray-700 mb-1">
                  短信验证码
                </label>
                <div class="flex items-center space-x-2">
                  <input
                    id="phone-verifycode"
                    v-model="phoneForm.verifycode"
                    type="text"
                    placeholder="请输入短信验证码"
                    class="flex-1 min-w-0 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="phoneErrors.verifycode ? 'border-red-500' : 'border-gray-300'"
                    :disabled="isLoading"
                  >
                  <CountDownButton
                    ref="phoneCountDownButtonRef"
                    class="flex-shrink-0"
                    :disabled="!canSendSms"
                    :loading="isSendingSms"
                    storage-key="reset-sms-time"
                    :countdown-seconds="60"
                    loading-text="发送中..."
                    default-text="发送验证码"
                    @click="handleSendSmsVerifyCode"
                  />
                </div>
                <div v-if="phoneErrors.verifycode" class="mt-1 text-sm text-red-600">
                  {{ phoneErrors.verifycode }}
                </div>
              </div>

              <div>
                <label for="phone-password" class="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <input
                  id="phone-password"
                  v-model="phoneForm.password"
                  type="password"
                  placeholder="请输入新密码（至少6位）"
                  class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="phoneErrors.password ? 'border-red-500' : 'border-gray-300'"
                  :disabled="isLoading"
                >
                <div v-if="phoneErrors.password" class="mt-1 text-sm text-red-600">
                  {{ phoneErrors.password }}
                </div>
              </div>

              <div>
                <label for="phone-confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <input
                  id="phone-confirm-password"
                  v-model="phoneForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="phoneErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'"
                  :disabled="isLoading"
                >
                <div v-if="phoneErrors.confirmPassword" class="mt-1 text-sm text-red-600">
                  {{ phoneErrors.confirmPassword }}
                </div>
              </div>

              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
              >
                {{ isPhoneLoading ? '重置中...' : '重置密码' }}
              </button>
            </form>
          </TabsContent>

          <TabsContent value="email">
            <form class="space-y-4" @submit.prevent="handleEmailReset">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <input
                  id="email"
                  v-model="emailForm.email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="emailErrors.email ? 'border-red-500' : 'border-gray-300'"
                  :disabled="isLoading"
                >
                <div v-if="emailErrors.email" class="mt-1 text-sm text-red-600">
                  {{ emailErrors.email }}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  图形验证码
                </label>
                <ImageVerifyCode
                  ref="emailImageVerifyCodeRef"
                  v-model="emailForm.imageVerifyAnswer"
                  :width="120"
                  :height="60"
                  :disabled="isLoading"
                  :error="!!emailErrors.imageVerifyAnswer"
                />
                <div v-if="emailErrors.imageVerifyAnswer" class="mt-1 text-sm text-red-600">
                  {{ emailErrors.imageVerifyAnswer }}
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  点击图片可刷新验证码
                </p>
              </div>

              <div>
                <label for="email-verifycode" class="block text-sm font-medium text-gray-700 mb-1">
                  邮箱验证码
                </label>
                <div class="flex items-center space-x-2">
                  <input
                    id="email-verifycode"
                    v-model="emailForm.verifycode"
                    type="text"
                    placeholder="请输入邮箱验证码"
                    class="flex-1 min-w-0 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="emailErrors.verifycode ? 'border-red-500' : 'border-gray-300'"
                    :disabled="isLoading"
                  >
                  <CountDownButton
                    ref="emailCountDownButtonRef"
                    class="flex-shrink-0"
                    :disabled="!canSendEmail"
                    :loading="isSendingEmail"
                    storage-key="reset-email-time"
                    :countdown-seconds="60"
                    loading-text="发送中..."
                    default-text="发送验证码"
                    @click="handleSendEmailVerifyCode"
                  />
                </div>
                <div v-if="emailErrors.verifycode" class="mt-1 text-sm text-red-600">
                  {{ emailErrors.verifycode }}
                </div>
              </div>

              <div>
                <label for="email-password" class="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <input
                  id="email-password"
                  v-model="emailForm.password"
                  type="password"
                  placeholder="请输入新密码（至少6位）"
                  class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="emailErrors.password ? 'border-red-500' : 'border-gray-300'"
                  :disabled="isLoading"
                >
                <div v-if="emailErrors.password" class="mt-1 text-sm text-red-600">
                  {{ emailErrors.password }}
                </div>
              </div>

              <div>
                <label for="email-confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <input
                  id="email-confirm-password"
                  v-model="emailForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="emailErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'"
                  :disabled="isLoading"
                >
                <div v-if="emailErrors.confirmPassword" class="mt-1 text-sm text-red-600">
                  {{ emailErrors.confirmPassword }}
                </div>
              </div>

              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
              >
                {{ isEmailLoading ? '重置中...' : '重置密码' }}
              </button>
            </form>
          </TabsContent>
        </TabsRoot>

        <div class="mt-6 text-center text-sm text-gray-600">
          想起密码了？
          <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
            返回登录
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
