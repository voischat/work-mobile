import { PiniaColada } from '@pinia/colada'
import * as Sentry from '@sentry/vue'
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

  if (import.meta.env.PROD) {
    Sentry.init({
      app,
      dsn: 'https://5d5999f219383701165be5c19d35662a@o4510758288097280.ingest.us.sentry.io/4510758290653184',
      // Setting this option to true will send default PII data to Sentry.
      // For example, automatic IP address collection on events
      sendDefaultPii: true,
    })
  }

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
