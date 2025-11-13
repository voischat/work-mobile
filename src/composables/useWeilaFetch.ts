import { getRootUrl } from '@kvoon/utils'
import { createFetch } from '@vueuse/core'
import md5 from 'md5'
import { computed } from 'vue'

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
  const token = localStorage.getItem('token')
  if (token)
    res.token = token
  return res
}

const baseUrl = `${getRootUrl(window.location.href)}/v2`

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
  },
})
