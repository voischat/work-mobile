<script setup lang="ts">
import type { BindEmailRequest } from '~/types/auth'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import BackLayout from '~/components/BackLayout.vue'
import { useForm } from '~/composables/useForm'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 表单验证 schema
const bindEmailSchema = z.object({
  email: z.string().email('请输入正确的邮箱地址'),
  verifycode: z.string().min(4, '验证码至少4位'),
})

type BindEmailForm = z.infer<typeof bindEmailSchema>

const router = useRouter()

// 表单数据
const formData = ref<BindEmailForm>({
  email: '',
  verifycode: '',
})

// 表单验证
const { errors, validate } = useForm(bindEmailSchema)

// 调用绑定邮箱 API
const { error, isFetching, isFinished, data, execute: bindEmail } = useWeilaFetch('/corp/user/bind-email', {
  immediate: false,
}).post(() => ({
  email: formData.value.email,
  verifycode: formData.value.verifycode,
} as BindEmailRequest)).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 监听绑定邮箱成功
watch([data, isFinished, error], ([result, finished, err]) => {
  if (!finished)
    return
  if (err)
    return
  if (result !== undefined) {
    alert('邮箱绑定成功')
    router.push('/me')
  }
})

function handleSubmit() {
  if (!validate(formData.value)) {
    return
  }
  bindEmail()
}
</script>

<template>
  <BackLayout title="绑定邮箱">
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- 邮箱输入框 -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="请输入邮箱地址"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.email ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
              <div v-if="errors.email" class="mt-1 text-sm text-red-600">
                {{ errors.email }}
              </div>
            </div>

            <!-- 验证码输入框 -->
            <div>
              <label for="verifycode" class="block text-sm font-medium text-gray-700 mb-1">
                验证码
              </label>
              <input
                id="verifycode"
                v-model="formData.verifycode"
                type="text"
                placeholder="请输入验证码"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.verifycode ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
              <div v-if="errors.verifycode" class="mt-1 text-sm text-red-600">
                {{ errors.verifycode }}
              </div>
              <p class="mt-1 text-xs text-gray-500">
                请向邮箱发送验证码后输入
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
                @click="router.push('/me')"
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
