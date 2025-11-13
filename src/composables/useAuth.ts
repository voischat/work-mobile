import { useLocalStorage } from '@vueuse/core'

export const token = useLocalStorage('token', '')
export const refreshToken = useLocalStorage('refresh_token', '')

export function clearAuth() {
  token.value = ''
  refreshToken.value = ''
}

export function saveAuth(accessTokenValue: string, refreshTokenValue: string) {
  token.value = accessTokenValue
  refreshToken.value = refreshTokenValue
}
