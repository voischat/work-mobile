<script setup lang="ts">
import { useMutation } from '@pinia/colada'
import md5 from 'md5'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useForm } from '~/composables/useForm'
import { weilaFetch } from '~/shared/instances'

const props = defineProps<{
  memberId: number
}>()

const { t } = useI18n()

const resetPasswordSchema = z.object({
  password: z.string().min(6, t('auth.validation.passwordMin')),
  confirmPassword: z.string().min(6, t('auth.validation.confirmPasswordMin')),
}).refine(data => data.password === data.confirmPassword, {
  message: t('auth.validation.passwordMismatch'),
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

const formData = ref<ResetPasswordForm>({
  password: '',
  confirmPassword: '',
})

const { errors, validate } = useForm(resetPasswordSchema)

const { mutate: resetPassword, isLoading: isFetching, error } = useMutation({
  mutation: (payload: { user_id: number, password: string }) => weilaFetch('/corp/address/reset-member-password', {
    method: 'POST',
    body: payload,
  }),
})

const errorMessage = computed(() => {
  return error.value?.message || ''
})

async function submit(): Promise<void> {
  if (isFetching.value) {
    return Promise.resolve()
  }

  if (!validate(formData.value)) {
    throw new Error(Object.values(errors.value)?.[0] || t('common.validation.validationFailed'))
  }

  await resetPassword({
    user_id: props.memberId,
    password: md5(formData.value.password),
  })
}

function reset() {
  formData.value = {
    password: '',
    confirmPassword: '',
  }
}

defineExpose({
  submit,
  reset,
  isFetching,
})
</script>

<template>
  <form class="space-y-4" @submit.prevent>
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('auth.fields.newPassword') }} <span class="text-red-500">{{ t('common.validation.requiredMark') }}</span>
      </label>
      <input
        id="password"
        v-model="formData.password"
        type="password"
        :placeholder="t('auth.placeholders.newPassword')"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.password ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
      <div v-if="errors.password" class="mt-1 text-sm text-red-600">
        {{ errors.password }}
      </div>
    </div>

    <div>
      <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('auth.fields.confirmPassword') }} <span class="text-red-500">{{ t('common.validation.requiredMark') }}</span>
      </label>
      <input
        id="confirmPassword"
        v-model="formData.confirmPassword"
        type="password"
        :placeholder="t('auth.placeholders.confirmPassword')"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.confirmPassword ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
      <div v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
        {{ errors.confirmPassword }}
      </div>
    </div>

    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </form>
</template>
