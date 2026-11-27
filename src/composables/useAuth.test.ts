import { beforeEach, describe, expect, it } from 'vitest'
import { storage, storageKey } from '~/shared/storage'
import { useAuth } from './useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuth().clearAuth()
  })

  it('persists the session in the keys weila-auth reads', async () => {
    useAuth().saveAuth('access', 'refresh', 3600)

    expect(useAuth().token.value).toBe('access')
    expect(localStorage.getItem(storageKey('token'))).toBe('access')
    expect(await storage.getItem('token')).toBe('access')
    expect(await storage.getItem('refresh_token')).toBe('refresh')
    expect(await storage.getItem('expires_in')).toBe(3600)
    expect(await storage.getItem('login_time')).toBeTruthy()
  })

  it('shares one session across callers', () => {
    const first = useAuth()
    const second = useAuth()

    first.saveAuth('access', 'refresh', 3600)

    expect(second.token.value).toBe('access')
    expect(second.refreshToken.value).toBe('refresh')
  })

  it('clears the session the fetch layer reads', async () => {
    useAuth().saveAuth('access', 'refresh', 3600)

    useAuth().clearAuth()

    expect(useAuth().token.value).toBe('')
    expect(await storage.getItem('token')).toBeFalsy()
    expect(await storage.getItem('refresh_token')).toBeFalsy()
    expect(await storage.getItem('expires_in')).toBeFalsy()
    expect(await storage.getItem('login_time')).toBeFalsy()
  })
})
