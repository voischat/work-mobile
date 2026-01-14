import { createDeepSeek } from '@ai-sdk/deepseek'
import { generateObject } from 'ai'
import { z } from 'zod'

const deepseek = createDeepSeek({
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY ?? '',
  baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL,
})

// 表单验证用的完整 schema（包含部门ID和头像）
export const addMemberSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  job_num: z.string().optional(),
  sex: z.number().int().min(1).max(2),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号').optional().or(z.literal('')),
  is_dept_admin: z.number().int().min(0).max(1),
  loc_share: z.number().int().min(0).max(1),
  track: z.number().int().min(0).max(4),
  password: z.string().min(6, '密码至少6位'),

  dept_id: z.number().int().min(0, '请选择部门'),
  avatar: z.string().optional().or(z.literal('')),
})

export type AddMemberForm = z.infer<typeof addMemberSchema>

export function useGenerateMember(curMember?: Ref<Record<string, any> | null>) {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const stringifyCurrent = () => {
    if (!curMember)
      return '{}'
    try {
      return JSON.stringify(toValue(curMember))
    }
    catch {
      return '{}'
    }
  }

  async function generate(prompt: string) {
    isLoading.value = true
    error.value = null

    try {
      const { object } = await generateObject({
        model: deepseek('deepseek-chat'),
        schema: addMemberSchema,
        prompt: [
          '你是一个成员信息生成助手',
          '根据用户描述和当前已有数据生成成员信息，请确保返回的是合理有效且尽量不重复的 JSON 格式数据。',
          '输出要求：严格返回单个 JSON 对象，不要多余文本或 markdown。',
          '字段：',
          '- dept_id：部门 id，0',
          '- avatar：头像 url，空字符串',
          '- name：成员姓名，字符串，可以添加一个随机数在名称后面',
          '- job_num：工号，可为空字符串',
          '- sex：数字 1 表示男、2 表示女',
          '- phone：11 位手机号，可为空字符串',
          '- is_dept_admin：0 非部门管理员，1 部门管理员',
          '- loc_share：0 不共享位置，1 共享位置',
          '- track：0~4 之间的整数',
          '- password：至少 6 位',
          `当前已有数据：${stringifyCurrent()}`,
          `用户描述：${prompt}`,
        ].join('\n'),
      })

      if (curMember)
        curMember.value = object

      console.log('object', object)

      return object
    }
    catch (err: any) {
      if (err instanceof z.ZodError) {
        error.value = `字段校验失败：${err.errors.map(e => e.message).join('、')}`
      }
      else {
        error.value = err.message || '解析失败，请重试'
      }
      console.error('数据解析失败请重试:', err)
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    isParsing: isLoading,
    error,
    generate,
  }
}
