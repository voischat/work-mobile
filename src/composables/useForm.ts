import type { z } from 'zod'
import { computed, ref, type Ref } from 'vue'

export function useForm<T extends z.ZodTypeAny>(schema: T) {
  const errors = ref<Record<string, string>>({}) as Ref<Record<string, string>>

  function validate(data: z.infer<T>): boolean {
    // 清空之前的验证错误
    errors.value = {}

    const result = schema.safeParse(data)
    if (!result.success) {
      // 将验证错误按字段分组
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        if (field) {
          errors.value[field] = issue.message
        }
      })
      return false
    }
    return true
  }

  function clearErrors() {
    errors.value = {}
  }

  function hasError(field: string) {
    return computed(() => !!errors.value[field])
  }

  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  return {
    errors,
    validate,
    clearErrors,
    hasError,
    hasErrors,
  }
}
