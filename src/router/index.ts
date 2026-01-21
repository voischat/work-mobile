import type { LoginResponse } from '~/types/auth'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { isLimitedWebview } from '~/shared/const'
import { storage, weilaFetch } from '~/shared/instances'

const router = createRouter({
  routes,
  history: createWebHashHistory(import.meta.env.BASE_URL),
})

router.beforeEach(async (to, from) => {
  const { account, password, 'country-code': countryCode } = to.query

  if (account && password && !from.name) {
    try {
      const response = await weilaFetch<LoginResponse>('/corp/auth/login', {
        method: 'POST',
        body: {
          country_code: countryCode as string || '',
          account: account as string,
          password: password as string,
        },
      })

      await storage.setItem('token', response.access_token)
      await storage.setItem('refresh_token', response.refresh_token)
      await storage.setItem('expires_in', response.expires_in)

      isLimitedWebview.value = true
      return { path: '/directory' }
    }
    catch (error) {
      console.error('Auto-login failed:', error)
      isLimitedWebview.value = false
      return { path: '/login' }
    }
  }

  return true
})

export default router
