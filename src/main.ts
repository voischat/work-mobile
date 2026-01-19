import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'
import { i18n } from './i18n'
import { initVConsole } from './utils/vconsole'

import './styles/main.css'

initVConsole().then(() => {
  const app = createApp(App)
  const pinia = createPinia()
  const router = createRouter({
    routes,
    history: createWebHashHistory(import.meta.env.BASE_URL),
  })
  app.use(pinia)
  app.use(PiniaColada, {
    queryOptions: {
      gcTime: 300_000,
    },
  })
  app.use(router)
  app.use(i18n)
  app.mount('#app')
})
