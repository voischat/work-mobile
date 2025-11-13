import { useLocalStorage } from '@vueuse/core'

export function useAuth() {
  const token = useLocalStorage('token', '')
  const refreshToken = useLocalStorage('refresh_token', '')

  function clearAuth() {
    token.value = ''
    refreshToken.value = ''
  }

  function saveAuth(accessTokenValue: string, refreshTokenValue: string) {
    token.value = accessTokenValue
    refreshToken.value = refreshTokenValue
  }
  return {
    token,
    refreshToken,
    clearAuth,
    saveAuth,
  }
}
