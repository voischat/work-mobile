<script setup lang="ts">
import type { Dept } from '~/types/management'
import { useMutation, useQueryCache } from '@pinia/colada'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const { showToast } = useToast()
const { t } = useI18n()

const addDeptSchema = z.object({
  name: z.string().min(1, t('directory.department.validation.nameRequired')),
})

type AddDeptForm = z.infer<typeof addDeptSchema>

const formData = ref<AddDeptForm>({
  name: '',
})

const { errors, validate } = useForm(addDeptSchema)

const { mutateAsync: createDept, error } = useMutation({
  mutation: (payload: AddDeptForm) => weilaFetch<{ dept: Dept }>('/corp/address/create-dept', {
    method: 'POST',
    body: {
      name: payload.name,
    },
  }),
  onSuccess: () => {
    const queryCache = useQueryCache()
    queryCache.invalidateQueries({ key: ['dept'] })
  },
})

const errorMessage = computed(() => {
  return error.value?.message || ''
})

async function submit(): Promise<false | { dept: Dept }> {
  if (!validate(formData.value)) {
    throw new Error(Object.values(errors.value)?.[0] || t('common.validation.validationFailed'))
  }

  try {
    const result = await createDept(formData.value)

    if (error?.value) {
      showToast(error?.value?.message || t('directory.department.createFailed'))
      return false
    }

    if (result) {
      showToast(t('directory.department.createSuccess'))
      return result
    }

    return false
  }
  catch (err) {
    console.error('部门创建失败:', err)
    showToast(t('directory.department.createFailed'))
    return false
  }
}

function reset() {
  formData.value = {
    name: '',
  }
}

defineExpose({
  submit,
  reset,
})
</script>

<template>
  <div class="space-y-4">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.department.fields.name') }}
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        :placeholder="t('common.placeholders.input') + t('directory.department.fields.name')"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.name ? 'border-red-500' : 'border-gray-300'"
      >
      <div v-if="errors.name" class="mt-1 text-sm text-red-600">
        {{ errors.name }}
      </div>
    </div>

    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>
