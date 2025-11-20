<script setup lang="ts">
import type { BindPhoneRequest, SendSmsVerifyCodeRequest } from '~/types/auth'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import BackLayout from '~/components/BackLayout.vue'
import CountDownButton from '~/components/CountDownButton.vue'
import ImageVerifyCode from '~/components/ImageVerifyCode.vue'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 表单验证 schema
const bindPhoneSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  country_code: z.string().min(1, '国家代码不能为空'),
  imageVerifyAnswer: z.string().min(1, '请输入图形验证码'),
  verifycode: z.string().min(4, '验证码至少4位'),
})

type BindPhoneForm = z.infer<typeof bindPhoneSchema>

const router = useRouter()
const { showToast } = useToast()

// 表单数据
const formData = ref<BindPhoneForm>({
  phone: '',
  country_code: '86',
  imageVerifyAnswer: '',
  verifycode: '',
})

// 组件引用
const imageVerifyCodeRef = ref<InstanceType<typeof ImageVerifyCode> | null>(null)
const countDownButtonRef = ref<InstanceType<typeof CountDownButton> | null>(null)

// 表单验证
const { errors, validate } = useForm(bindPhoneSchema)

// 发送短信验证码
const {
  error: sendSmsError,
  isFetching: isSendingSms,
  execute: sendSmsVerifyCode,
} = useWeilaFetch('/common/send-sms-verifycode', {
  immediate: false,
}).post(() => ({
  phone: formData.value.phone,
  countrycode: formData.value.country_code,
  verify_id: imageVerifyCodeRef.value?.verifyId || '',
  verify_answer: formData.value.imageVerifyAnswer,
  smstype: 'work-bind',
} as SendSmsVerifyCodeRequest)).json()

// 调用绑定手机 API
const { error, isFetching, isFinished, data, execute: bindPhone } = useWeilaFetch('/corp/user/bind-phone', {
  immediate: false,
}).post(() => ({
  phone: formData.value.phone,
  country_code: formData.value.country_code,
  verifycode: formData.value.verifycode,
} as BindPhoneRequest)).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 监听发送短信验证码错误，使用 toast 显示
watch(sendSmsError, (err) => {
  if (err) {
    showToast(err.message || '发送验证码失败')
    // 如果图形验证码错误，刷新图形验证码
    imageVerifyCodeRef.value?.refresh()
  }
})

// 发送短信验证码函数
async function handleSendSmsVerifyCode() {
  // 验证手机号
  if (!formData.value.phone || !/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    showToast('请输入正确的手机号')
    return
  }

  // 验证图形验证码
  if (!formData.value.imageVerifyAnswer) {
    showToast('请输入图形验证码')
    return
  }

  try {
    await sendSmsVerifyCode()
    // 如果执行到这里且没有错误，说明发送成功
    if (!sendSmsError.value) {
      showToast('验证码已发送')
      // 通知组件开始倒计时
      countDownButtonRef.value?.startCountdown()
    }
  }
  catch (err) {
    // 错误会通过 watch sendSmsError 来处理并显示 toast
    // 如果 watch 没有触发（异常被抛出但 error 未设置），这里也显示 toast
    if (!sendSmsError.value) {
      showToast(err instanceof Error ? err.message : '发送验证码失败')
      imageVerifyCodeRef.value?.refresh()
    }
  }
}

// 是否可以发送验证码
const canSendSms = computed(() => {
  return formData.value.phone
    && /^1[3-9]\d{9}$/.test(formData.value.phone)
    && formData.value.imageVerifyAnswer
    && !isSendingSms.value
})

// 监听绑定手机成功
watch([data, isFinished, error], ([result, finished, err]) => {
  if (!finished)
    return
  if (err)
    return
  if (result !== undefined) {
    showToast('手机号绑定成功')
    router.back()
  }
})

function handleSubmit() {
  if (!validate(formData.value)) {
    return
  }
  bindPhone()
}
</script>

<template>
  <BackLayout title="绑定手机">
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- 国家代码输入框 -->
            <div>
              <label for="country_code" class="block text-sm font-medium text-gray-700 mb-1">
                国家代码
              </label>
              <input
                id="country_code"
                v-model="formData.country_code"
                type="text"
                placeholder="请输入国家代码（如：86）"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.country_code ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
              <div v-if="errors.country_code" class="mt-1 text-sm text-red-600">
                {{ errors.country_code }}
              </div>
            </div>

            <!-- 手机号输入框 -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                手机号
              </label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                placeholder="请输入手机号"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.phone ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
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
                :disabled="isFetching"
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
                  class="flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="errors.verifycode ? 'border-red-500' : 'border-gray-300'"
                  :disabled="isFetching"
                >
                <CountDownButton
                  ref="countDownButtonRef"
                  :disabled="!canSendSms"
                  :loading="isSendingSms"
                  storage-key="send-sms-time"
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
                :disabled="isFetching"
                @click="router.back()"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isFetching"
              >
                {{ isFetching ? '绑定中...' : '确认绑定' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
