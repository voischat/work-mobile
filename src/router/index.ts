import type { LoginResponse } from '~/types/auth'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useAuth } from '~/composables/useAuth'
import { isGlobalLoading } from '~/composables/useGlobalLoading'
import { isLimitedWebview } from '~/shared/const'
import { weilaFetch } from '~/shared/instances'

const { saveAuth } = useAuth()

const router = createRouter({
  routes,
  history: createWebHashHistory(import.meta.env.BASE_URL),
})

router.beforeEach(async (to, from) => {
  const { account, password, 'country-code': countryCode } = to.query

  if (account && password && !from.name) {
    isGlobalLoading.value = true
    try {
      const response = await weilaFetch<LoginResponse>('/corp/auth/login', {
        method: 'POST',
        body: {
          country_code: countryCode as string || '',
          account: account as string,
          password: password as string,
        },
      })

      saveAuth(response.access_token, response.refresh_token, response.expires_in)

      isLimitedWebview.value = true
      isGlobalLoading.value = false
      return { path: '/directory' }
    }
    catch (error) {
      console.error('Auto-login failed:', error)
      isLimitedWebview.value = false
      isGlobalLoading.value = false
      return { path: '/login' }
    }
  }

  return true
})

export default router
