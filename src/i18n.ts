import messages from '@intlify/unplugin-vue-i18n/messages'
import { usePreferredLanguages } from '@vueuse/core'
import { createI18n } from 'vue-i18n'

const savedLocale = localStorage.getItem('locale')
const preferredLanguages = usePreferredLanguages()
const browserLocale = preferredLanguages.value[0]?.split('-')[0] || 'en'
const defaultLocale = savedLocale || browserLocale

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages,
})
