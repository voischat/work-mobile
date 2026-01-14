export function useAuth() {
  const token = useLocalStorage('token', '')
  const refreshToken = useLocalStorage('refresh_token', '')

  function clearAuth() {
    token.value = ''
    refreshToken.value = ''
  }

  function saveAuth(accessTokenValue: string, refreshTokenValue: string, expiresInValue: number) {
    token.value = accessTokenValue
    refreshToken.value = refreshTokenValue

    storage.setItem('token', accessTokenValue)
    storage.setItem('refresh_token', refreshTokenValue)
    storage.setItem('expires_in', expiresInValue)
  }
  return {
    token,
    refreshToken,
    clearAuth,
    saveAuth,
  }
}
