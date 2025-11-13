import { getRootUrl } from '@kvoon/utils'
import { createFetch } from '@vueuse/core'
import md5 from 'md5'
import { computed } from 'vue'

import { useAuth } from './useAuth'

const { token } = useAuth()

export const appid = computed(() => {
  const demo = '102036'
  const normal = '102065'
  return (import.meta.env.DEV || import.meta.env.MODE === 'staging') ? demo : normal
})

export const appkey = computed(() => {
  const demo = 'b3c658bd2e637c65efb134fb381d4a18'
  const normal = '3c227f2cbc2084ebdd9617fd283c42c7'
  return (import.meta.env.DEV || import.meta.env.MODE === 'staging') ? demo : normal
})

function getMd5Middle8Chars(md5Str: string): string {
  // 888e0f79573741ac3e1f09a3c9e46968 -> 41ac3e1f
  return md5Str.slice(12, 20)
}

function generateV2Query(): Record<string, string> {
  const timestamp = Date.now() || -1
  const et = Math.floor(timestamp / 1000)
  const app_sign = md5(`${et}${appkey.value}`)
  const app_sign_v2 = getMd5Middle8Chars(app_sign)
  const res: Record<string, string> = {
    appid: appid.value,
    et: String(et),
    sign: app_sign_v2,
  }
  if (token.value)
    res.token = token.value
  return res
}

const baseUrl = `${getRootUrl(window.location.href)}/v2`

interface WeilaApiResponse<T = any> {
  errcode: number
  errmsg: string
  data?: T
}

export const useWeilaFetch = createFetch({
  baseUrl,
  options: {
    async beforeFetch({ url, options }) {
      const queryParams = generateV2Query()
      // url 可能是相对路径，需要与 baseUrl 组合
      const fullUrl = url.startsWith('http') ? url : new URL(url, baseUrl).toString()
      const urlObj = new URL(fullUrl)
      Object.entries(queryParams).forEach(([key, value]) => {
        urlObj.searchParams.set(key, value)
      })
      return {
        url: urlObj.toString(),
        options,
      }
    },
    async afterFetch(ctx) {
      const { data } = ctx
      // 确保 data 是对象格式
      if (!data || typeof data !== 'object') {
        throw new Error('响应格式错误')
      }

      const apiResponse = data as WeilaApiResponse

      // 检查 errcode 是否存在
      if (typeof apiResponse.errcode !== 'number') {
        throw new TypeError('响应格式错误：缺少 errcode')
      }

      // errcode 为 0 表示成功
      if (apiResponse.errcode === 0) {
        // 返回 data 字段，如果没有则为 undefined
        ctx.data = apiResponse.data
        console.log('data', ctx.data)
        return ctx
      }

      // errcode 为 31 表示 token 失效
      if (apiResponse.errcode === 31) {
        // TODO: 处理 token 失效
        throw new Error(apiResponse.errmsg || 'Token 失效')
      }

      // 其他 errcode 值表示失败
      console.log('error', apiResponse.errmsg)
      throw new Error(apiResponse.errmsg || `请求失败，错误码: ${apiResponse.errcode}`)
    },
  },
})
