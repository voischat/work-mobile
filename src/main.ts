import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'
import { initVConsole } from './utils/vconsole'

import './styles/main.css'

// Initialize VConsole before app renders
initVConsole().then(() => {
  const app = createApp(App)
  const router = createRouter({
    routes,
    history: createWebHashHistory(import.meta.env.BASE_URL),
  })
  app.use(router)
  app.mount('#app')
})
