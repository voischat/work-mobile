import { isObject, objectKeys } from '@antfu/utils'
import { getRootUrl } from '@kvoon/utils'
import { createFetch } from '@vueuse/core'
import md5 from 'md5'
import { computed } from 'vue'

import { useAuth } from './useAuth'

const { token, refreshToken, saveAuth, clearAuth } = useAuth()

// 刷新 token 的状态管理
let isRefreshing = false
const refreshSubscribers: Array<() => void> = []

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

export interface WeilaRes<T = any> {
  data?: T
}

export function pickWeilaData(weilaRes: WeilaRes): any {
  const { data } = weilaRes

  if (isObject(data)) {
    const keys = objectKeys(data)

    if (keys.length === 1)
      return weilaRes.data?.[keys[0]]
  }

  return weilaRes.data
}

// 刷新 token 的函数
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken.value) {
    return false
  }

  try {
    // 生成查询参数（刷新 token 时不需要 token 参数）
    const queryParams = generateV2Query()
    delete queryParams.token // 刷新 token 时不需要旧的 token

    const urlObj = new URL(`${baseUrl}/corp/auth/refresh`)
    Object.entries(queryParams).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value)
    })

    const response = await fetch(urlObj.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken.value,
      }),
    })

    const result = await response.json()
    const apiResponse = result as WeilaApiResponse<{
      access_token: string
      expires_in: number
      refresh_token: string
    }>

    if (apiResponse.errcode === 0 && apiResponse.data) {
      saveAuth(apiResponse.data.access_token, apiResponse.data.refresh_token)
      return true
    }

    // 刷新失败，清除认证信息
    clearAuth()
    return false
  }
  catch (error) {
    console.error('刷新 token 失败:', error)
    clearAuth()
    return false
  }
}

// 通知所有等待的请求
function onRefreshed() {
  refreshSubscribers.forEach(callback => callback())
  refreshSubscribers.length = 0
}

// 添加等待刷新的订阅者
function addRefreshSubscriber(callback: () => void) {
  refreshSubscribers.push(callback)
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
      const { data, execute } = ctx
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
        // 使用 pickWeilaData 处理返回值
        ctx.data = pickWeilaData({ data: apiResponse.data })
        console.log('data', ctx.data)
        return ctx
      }

      // errcode 为 31 表示 token 失效，需要刷新 token
      if (apiResponse.errcode === 31) {
        // 如果正在刷新，将当前请求加入等待队列
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            addRefreshSubscriber(() => {
              execute()
                .then((response) => {
                  resolve(response)
                })
                .catch((error) => {
                  reject(error)
                })
            })
          })
        }

        // 开始刷新 token
        isRefreshing = true
        const refreshSuccess = await refreshAccessToken()

        if (refreshSuccess) {
          isRefreshing = false
          // 通知所有等待的请求
          onRefreshed()
          // 重试当前请求
          return execute()
        }
        else {
          isRefreshing = false
          refreshSubscribers.length = 0
          throw new Error(apiResponse.errmsg || 'Token 失效，刷新失败')
        }
      }

      // 其他 errcode 值表示失败
      console.log('error', apiResponse.errmsg)
      throw new Error(apiResponse.errmsg || `请求失败，错误码: ${apiResponse.errcode}`)
    },
  },
})
