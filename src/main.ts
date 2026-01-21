import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'
import router from './router'
import { initVConsole } from './utils/vconsole'

import './styles/main.css'

initVConsole().then(() => {
  const app = createApp(App)
  const pinia = createPinia()
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
