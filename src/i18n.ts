import messages from '@intlify/unplugin-vue-i18n/messages'
import { createI18n } from 'vue-i18n'

const savedLocale = localStorage.getItem('locale')
const defaultLocale = savedLocale || 'en'

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages,
})
