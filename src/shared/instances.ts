import type { RefreshTokenResult } from 'weila-auth'
import { getRootUrl } from '@kvoon/utils'
import md5 from 'md5'
import { nanoid } from 'nanoid'
import { createWeilaFetch } from 'weila-auth'
import { useAuth } from '~/composables/useAuth'
import { appid, appkey } from '~/shared/const'
import { storage } from '~/shared/storage'

const { refreshToken, saveAuth, clearAuth } = useAuth()

function getMd5Middle8Chars(md5Str: string): string {
  return md5Str.slice(12, 20)
}

function genUUID(appName: string): string {
  const uuidKey = `__${appName}-uuid__`
  let uuid = window.localStorage.getItem(uuidKey)
  if (!uuid) {
    uuid = nanoid()
    window.localStorage.setItem(uuidKey, uuid)
  }
  return uuid
}

function generateV2Query(): Record<string, string> {
  const timestamp = Date.now() || -1
  const et = Math.floor(timestamp / 1000)
  const app_sign = md5(`${et}${appkey.value}`)
  const app_sign_v2 = getMd5Middle8Chars(app_sign)
  const uuid = genUUID('weila-work-webview')
  return {
    appid: appid.value,
    et: String(et),
    sign: app_sign_v2,
    uuid,
  }
}

export const weilaFetch = createWeilaFetch({
  appId: appid.value,
  appKey: appkey.value,
  baseURL: `${getRootUrl(window.location.href)}/v2`,
  storage,
  onRefreshToken: async (): Promise<RefreshTokenResult> => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    const queryParams = generateV2Query()
    const urlObj = new URL(`${getRootUrl(window.location.href)}/v2/corp/auth/refresh`)
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

    if (result.errcode === 0 && result.data) {
      const { access_token, refresh_token, expires_in } = result.data
      saveAuth(access_token, refresh_token, expires_in)
      return {
        token: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
      }
    }

    throw new Error(result.errmsg || 'Token refresh failed')
  },
  onLogout: () => {
    clearAuth()
    window.location.hash = '#/login'
    window.location.reload()
  },
})
