<script setup lang="ts">
import md5 from 'md5'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import BackLayout from '~/components/BackLayout.vue'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

// 从路由参数获取成员 ID
const memberId = computed(() => Number(route.params.id))

// 表单验证 schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string().min(6, '确认密码至少6位'),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

// 表单数据
const formData = ref<ResetPasswordForm>({
  password: '',
  confirmPassword: '',
})

// 表单验证
const { errors, validate } = useForm(resetPasswordSchema)

// 调用重置密码 API
const { error, isFetching, isFinished, data, execute: resetPassword } = useWeilaFetch('/corp/address/reset-member-password', {
  immediate: false,
}).post(() => ({
  user_id: memberId.value,
  password: md5(formData.value.password),
})).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 监听重置密码成功
watch([data, isFinished, error], ([result, finished, err]) => {
  if (!finished)
    return
  if (err)
    return
  if (result !== undefined) {
    showToast('密码重置成功')
    router.back()
  }
})

function handleSubmit() {
  if (!validate(formData.value)) {
    return
  }
  resetPassword()
}
</script>

<template>
  <BackLayout title="重置密码">
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- 新密码输入框 -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                新密码 <span class="text-red-500">*</span>
              </label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                placeholder="请输入新密码（至少6位）"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.password ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
              <div v-if="errors.password" class="mt-1 text-sm text-red-600">
                {{ errors.password }}
              </div>
            </div>

            <!-- 确认密码输入框 -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                确认密码 <span class="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.confirmPassword ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
              <div v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
                {{ errors.confirmPassword }}
              </div>
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
                {{ isFetching ? '重置中...' : '确认重置' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
