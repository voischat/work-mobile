import type { z } from 'zod'
import { computed, ref } from 'vue'

export function useForm<T extends z.ZodType>(schema: T) {
  const errorsRef = ref<Record<string, string>>({})
  const { t } = useI18n()

  function validate(data: z.infer<T>): boolean {
    // 清空之前的验证错误
    errorsRef.value = {}

    const result = schema.safeParse(data)
    if (!result.success) {
      // 将验证错误按字段分组
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        if (field)
          errorsRef.value[field] = t(issue.message)
      })
      return false
    }
    return true
  }

  function clearErrors() {
    errorsRef.value = {}
  }

  function hasError(field: string) {
    return computed(() => !!errorsRef.value[field])
  }

  const hasErrors = computed(() => Object.keys(errorsRef.value).length > 0)

  // 返回 computed 对象，可以直接解构并在模板中使用
  const errors = computed(() => errorsRef.value)

  return {
    errors,
    validate,
    clearErrors,
    hasError,
    hasErrors,
  }
}
