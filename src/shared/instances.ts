import type { RefreshTokenResult } from 'weila-auth'
import { getRootUrl } from '@kvoon/utils'
import { createStorage } from 'unstorage'
import localStorage from 'unstorage/drivers/localstorage'
import { createWeilaFetch } from 'weila-auth'
import { useAuth } from '~/composables/useAuth'
import { name } from '../../package.json'

export const storage = createStorage({
  driver: localStorage({
    base: name,
  }),
})

const { refreshToken, saveAuth, clearAuth } = useAuth()

export const weilaFetch = createWeilaFetch({
  appId: appid.value,
  appKey: appkey.value,
  baseURL: `${getRootUrl(window.location.href)}/v2`,
  storage,
  onRefreshToken: async (): Promise<RefreshTokenResult> => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${getRootUrl(window.location.href)}/v2/corp/auth/refresh`, {
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
  onLogout: async () => {
    clearAuth()
    window.location.href = '/login'
  },
})
