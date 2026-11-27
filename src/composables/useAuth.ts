import { ref } from 'vue'
import { storage, storageKey } from '~/shared/storage'

const token = ref(localStorage.getItem(storageKey('token')) ?? '')
const refreshToken = ref(localStorage.getItem(storageKey('refresh_token')) ?? '')

function clearAuth() {
  token.value = ''
  refreshToken.value = ''

  storage.removeItem('token')
  storage.removeItem('refresh_token')
  storage.removeItem('expires_in')
  storage.removeItem('login_time')

  // Keys written by the pre-unstorage session shape.
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
}

function saveAuth(accessTokenValue: string, refreshTokenValue: string, expiresInValue: number) {
  token.value = accessTokenValue
  refreshToken.value = refreshTokenValue

  storage.setItem('token', accessTokenValue)
  storage.setItem('refresh_token', refreshTokenValue)
  storage.setItem('expires_in', expiresInValue)
  storage.setItem('login_time', Math.floor(Date.now() / 1000))
}

export function useAuth() {
  return {
    token,
    refreshToken,
    clearAuth,
    saveAuth,
  }
}
