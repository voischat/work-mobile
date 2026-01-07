<script setup lang="ts">
import type { LoginByEmailRequest, LoginBySmsRequest, LoginResponse, SendEmailVerifyCodeRequest, SendSmsVerifyCodeRequest } from '~/types/auth'
import { Icon } from '@iconify/vue'
import { useMutation } from '@pinia/colada'
import { useFocus, useLocalStorage } from '@vueuse/core'
import md5 from 'md5'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger, TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import CountDownButton from '~/components/CountDownButton.vue'
import ImageVerifyCode from '~/components/ImageVerifyCode.vue'
import { useAuth } from '~/composables/useAuth'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const passwordSchema = z.object({
  account: z.string().min(1, '账号不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

const phoneSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  imageVerifyAnswer: z.string().min(1, '请输入图形验证码'),
  verifycode: z.string().min(4, '验证码至少4位'),
})

const emailSchema = z.object({
  email: z.string().email('请输入正确的邮箱地址'),
  imageVerifyAnswer: z.string().min(1, '请输入图形验证码'),
  verifycode: z.string().min(4, '验证码至少4位'),
})

const router = useRouter()
const { saveAuth } = useAuth()
const { showToast } = useToast()

const passwordForm = ref({ account: '', password: '' })
const phoneForm = ref({ phone: '', imageVerifyAnswer: '', verifycode: '' })
const emailForm = ref({ email: '', imageVerifyAnswer: '', verifycode: '' })

const rememberPassword = ref(false)
const savedCredentials = useLocalStorage<Record<string, string>>('saved-credentials', {}, {
  serializer: {
    read: v => v ? JSON.parse(v) : {},
    write: v => JSON.stringify(v),
  },
})
const accountInputRef = ref<HTMLInputElement | null>(null)
const { focused: isAccountInputFocused } = useFocus(accountInputRef)
const savedAccounts = computed(() => Object.keys(savedCredentials.value))
const showAccountHints = computed(() => isAccountInputFocused.value && savedAccounts.value.length > 0)

const isPasswordFromStorage = ref(false)

function selectAccount(account: string) {
  passwordForm.value.account = account
  passwordForm.value.password = savedCredentials.value[account] || ''
  isPasswordFromStorage.value = !!savedCredentials.value[account]
  isAccountInputFocused.value = false
}

function deleteAccount(account: string) {
  const { [account]: _, ...rest } = savedCredentials.value
  savedCredentials.value = rest
  if (passwordForm.value.account === account) {
    passwordForm.value.account = ''
    passwordForm.value.password = ''
    isPasswordFromStorage.value = false
  }
}

function clearAccountInput() {
  passwordForm.value.account = ''
  passwordForm.value.password = ''
  isPasswordFromStorage.value = false
}

onMounted(() => {
  const firstAccount = savedAccounts.value[0]
  if (firstAccount) {
    passwordForm.value.account = firstAccount
    passwordForm.value.password = savedCredentials.value[firstAccount]
    isPasswordFromStorage.value = true
    rememberPassword.value = true
  }
})

watch(rememberPassword, (newVal) => {
  if (!newVal) {
    const { [passwordForm.value.account]: _, ...rest } = savedCredentials.value
    savedCredentials.value = rest
  }
})

const phoneImageVerifyCodeRef = ref<InstanceType<typeof ImageVerifyCode> | null>(null)
const phoneCountDownButtonRef = ref<InstanceType<typeof CountDownButton> | null>(null)
const emailImageVerifyCodeRef = ref<InstanceType<typeof ImageVerifyCode> | null>(null)
const emailCountDownButtonRef = ref<InstanceType<typeof CountDownButton> | null>(null)

const { errors: passwordErrors, validate: validatePassword } = useForm(passwordSchema)
const { errors: phoneErrors, validate: validatePhone } = useForm(phoneSchema)
const { errors: emailErrors, validate: validateEmail } = useForm(emailSchema)

function handleLoginSuccess(loginData: LoginResponse) {
  showToast('登录成功')
  saveAuth(loginData.access_token, loginData.refresh_token, loginData.expires_in)
  if (rememberPassword.value) {
    const passwordHash = isPasswordFromStorage.value
      ? passwordForm.value.password
      : md5(passwordForm.value.password)
    savedCredentials.value = {
      ...savedCredentials.value,
      [passwordForm.value.account]: passwordHash,
    }
  }
  router.push('/')
}

const { mutate: loginByPassword, isLoading: isPasswordLoading } = useMutation({
  mutation: () => {
    const passwordHash = isPasswordFromStorage.value
      ? passwordForm.value.password
      : md5(passwordForm.value.password)
    return weilaFetch<LoginResponse>('/corp/auth/login', {
      method: 'POST',
      body: {
        account: passwordForm.value.account,
        password: passwordHash,
      },
    })
  },
  onSuccess: handleLoginSuccess,
  onError: error => showToast(error.message || '登录失败'),
})

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

const { mutate: loginBySms, isLoading: isSmsLoading } = useMutation({
  mutation: (params: LoginBySmsRequest) =>
    weilaFetch<LoginResponse>('/corp/auth/login-by-sms', { method: 'POST', body: params }),
  onSuccess: handleLoginSuccess,
  onError: error => showToast(error.message || '登录失败'),
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

const { mutate: loginByEmail, isLoading: isEmailLoading } = useMutation({
  mutation: (params: LoginByEmailRequest) =>
    weilaFetch<LoginResponse>('/corp/auth/login-by-email', { method: 'POST', body: params }),
  onSuccess: handleLoginSuccess,
  onError: error => showToast(error.message || '登录失败'),
})

const isLoading = computed(() => isPasswordLoading.value || isSmsLoading.value || isEmailLoading.value)

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
    smstype: 'work-login',
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
    smstype: 'work-login',
  })
}

function handlePasswordLogin() {
  if (!validatePassword(passwordForm.value)) {
    showToast(Object.values(passwordErrors.value)?.[0] || '表单验证失败')
    return
  }
  loginByPassword()
}

function handlePhoneLogin() {
  if (!validatePhone(phoneForm.value)) {
    showToast(Object.values(phoneErrors.value)?.[0] || '表单验证失败')
    return
  }
  loginBySms({
    phone: phoneForm.value.phone,
    country_code: '86',
    verifycode: phoneForm.value.verifycode,
  })
}

function handleEmailLogin() {
  if (!validateEmail(emailForm.value)) {
    showToast(Object.values(emailErrors.value)?.[0] || '表单验证失败')
    return
  }
  loginByEmail({
    email: emailForm.value.email,
    verifycode: emailForm.value.verifycode,
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          登录
        </h1>

        <TabsRoot default-value="password">
          <TabsList class="flex border-b border-gray-200 mb-6">
            <TabsTrigger
              value="password"
              class="flex-1 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              密码登录
            </TabsTrigger>
            <TabsTrigger
              value="phone"
              class="flex-1 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              手机号登录
            </TabsTrigger>
            <TabsTrigger
              value="email"
              class="flex-1 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              邮箱登录
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form class="space-y-4" @submit.prevent="handlePasswordLogin">
              <div>
                <label for="account" class="block text-sm font-medium text-gray-700 mb-1">
                  账号
                </label>
                <PopoverRoot :open="showAccountHints">
                  <div class="relative">
                    <PopoverTrigger
                      id="account"
                      ref="accountInputRef"
                      as="input"
                      type="text"
                      :value="passwordForm.account"
                      placeholder="请输入账号"
                      class="w-full px-3 py-2 pr-8 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="passwordErrors.account ? 'border-red-500' : 'border-gray-300'"
                      :disabled="isLoading"
                      @input="passwordForm.account = ($event.target as HTMLInputElement).value"
                    />
                    <button
                      v-if="passwordForm.account"
                      type="button"
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      @mousedown.prevent="clearAccountInput"
                    >
                      <Icon icon="lucide:x" class="w-4 h-4" />
                    </button>
                  </div>
                  <PopoverPortal>
                    <PopoverContent
                      :side-offset="4"
                      align="start"
                      class="z-50 w-[--reka-popover-trigger-width] max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg"
                      @open-auto-focus.prevent
                    >
                      <div
                        v-for="account in savedAccounts"
                        :key="account"
                        class="flex items-center justify-between px-3 py-2 hover:bg-gray-100"
                      >
                        <button
                          type="button"
                          class="flex-1 text-sm text-left cursor-pointer"
                          @mousedown.prevent="selectAccount(account)"
                        >
                          {{ account }}
                        </button>
                        <button
                          type="button"
                          class="p-1 text-gray-400 hover:text-red-500"
                          @mousedown.prevent="deleteAccount(account)"
                        >
                          <Icon icon="lucide:x" class="w-4 h-4" />
                        </button>
                      </div>
                    </PopoverContent>
                  </PopoverPortal>
                </PopoverRoot>
                <div v-if="passwordErrors.account" class="mt-1 text-sm text-red-600">
                  {{ passwordErrors.account }}
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input
                  id="password"
                  v-model="passwordForm.password"
                  type="password"
                  placeholder="请输入密码"
                  class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="passwordErrors.password ? 'border-red-500' : 'border-gray-300'"
                  :disabled="isLoading"
                  @input="isPasswordFromStorage = false"
                >
                <div v-if="passwordErrors.password" class="mt-1 text-sm text-red-600">
                  {{ passwordErrors.password }}
                </div>
              </div>

              <div class="flex items-center justify-between">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="rememberPassword"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm text-gray-600">记住密码</span>
                </label>
                <router-link to="/reset-password" class="text-sm text-blue-600 hover:text-blue-700">
                  忘记密码？
                </router-link>
              </div>

              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
              >
                {{ isPasswordLoading ? '登录中...' : '登录' }}
              </button>
            </form>
          </TabsContent>

          <TabsContent value="phone">
            <form class="space-y-4" @submit.prevent="handlePhoneLogin">
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
                    storage-key="login-sms-time"
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

              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
              >
                {{ isSmsLoading ? '登录中...' : '登录' }}
              </button>
            </form>
          </TabsContent>

          <TabsContent value="email">
            <form class="space-y-4" @submit.prevent="handleEmailLogin">
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
                    storage-key="login-email-time"
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

              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
              >
                {{ isEmailLoading ? '登录中...' : '登录' }}
              </button>
            </form>
          </TabsContent>
        </TabsRoot>

        <div class="mt-6 text-center text-sm text-gray-600">
          还没有账号？
          <router-link to="/register" class="text-blue-600 hover:text-blue-700 font-medium">
            立即注册
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
