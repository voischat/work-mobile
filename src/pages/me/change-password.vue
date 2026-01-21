<script setup lang="ts">
import type { ChangePasswordRequest } from '~/types/auth'
import { useMutation } from '@pinia/colada'
import md5 from 'md5'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const router = useRouter()
const { showToast } = useToast()
const { t } = useI18n()

const changePasswordSchema = z.object({
  old_password: z.string().min(1, t('me.validation.oldPasswordRequired')),
  new_password: z.string().min(6, t('me.validation.newPasswordMin')),
  confirm_password: z.string().min(1, t('auth.validation.confirmPasswordRequired')),
}).refine(data => data.new_password === data.confirm_password, {
  message: t('auth.validation.passwordMismatch'),
  path: ['confirm_password'],
})

  type ChangePasswordForm = z.infer<typeof changePasswordSchema>

const formData = ref<ChangePasswordForm>({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const { errors, validate } = useForm(changePasswordSchema)

const { mutate: changePassword, isLoading } = useMutation({
  mutation: (params: ChangePasswordRequest) =>
    weilaFetch('/corp/user/change-password', {
      method: 'POST',
      body: params,
    }),
  onSuccess() {
    showToast('密码修改成功')
    router.push('/me')
  },
  onError(error) {
    showToast(error.message || '密码修改失败')
  },
})

function handleSubmit() {
  if (!validate(formData.value)) {
    showToast(Object.values(errors.value)?.[0] || t('common.validation.validationFailed'))
    return
  }
  changePassword({
    old_password: md5(formData.value.old_password),
    new_password: md5(formData.value.new_password),
  })
}
</script>

<template>
  <BackLayout title="修改密码">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '我的', route: '/me' },
          { name: '修改密码' },
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- 旧密码输入框 -->
            <div>
              <label for="old_password" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('me.changePassword.oldPassword') }}
              </label>
              <input
                id="old_password"
                v-model="formData.old_password"
                type="password"
                :placeholder="t('auth.validation.oldPasswordRequired')"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.old_password ? 'border-red-500' : 'border-gray-300'"
                :disabled="isLoading"
              >
              <div v-if="errors.old_password" class="mt-1 text-sm text-red-600">
                {{ errors.old_password }}
              </div>
            </div>

            <!-- 新密码输入框 -->
            <div>
              <label for="new_password" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('me.changePassword.newPassword') }}
              </label>
              <input
                id="new_password"
                v-model="formData.new_password"
                type="password"
                :placeholder="t('auth.validation.newPasswordMin')"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.new_password ? 'border-red-500' : 'border-gray-300'"
                :disabled="isLoading"
              >
              <div v-if="errors.new_password" class="mt-1 text-sm text-red-600">
                {{ errors.new_password }}
              </div>
            </div>

            <!-- 确认密码输入框 -->
            <div>
              <label for="confirm_password" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('me.changePassword.confirmPassword') }}
              </label>
              <input
                id="confirm_password"
                v-model="formData.confirm_password"
                type="password"
                :placeholder="t('auth.placeholders.confirmPassword')"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.confirm_password ? 'border-red-500' : 'border-gray-300'"
                :disabled="isLoading"
              >
              <div v-if="errors.confirm_password" class="mt-1 text-sm text-red-600">
                {{ errors.confirm_password }}
              </div>
            </div>

            <!-- 按钮组 -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
                @click="router.push('/me')"
              >
                {{ t('me.changePassword.cancel') }}
              </button>
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
              >
                {{ isLoading ? t('me.changePassword.submitting') : t('me.changePassword.confirmSubmit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
