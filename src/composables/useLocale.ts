import { usePreferredLanguages } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

export function useLocale() {
  const { locale, availableLocales } = useI18n()
  const preferredLanguages = usePreferredLanguages()

  const systemLang = preferredLanguages.value[0]?.toLowerCase() || 'en'
  const savedLocale = localStorage.getItem('locale')

  function getLocale(lang: string): string {
    if (availableLocales.includes(lang))
      return lang

    const base = lang.split('-')[0]

    if (base.startsWith('zh') && availableLocales.includes('zh-CN'))
      return 'zh-CN'

    if (base.startsWith('en') && availableLocales.includes('en'))
      return 'en'

    return 'en'
  }

  const initialLocale = savedLocale && availableLocales.includes(savedLocale)
    ? savedLocale
    : getLocale(systemLang)

  if (locale.value !== initialLocale)
    locale.value = initialLocale

  function setLocale(newLocale: string) {
    if (availableLocales.includes(newLocale)) {
      locale.value = newLocale
      localStorage.setItem('locale', newLocale)
    }
  }

  return {
    locale,
    setLocale,
    availableLocales,
  }
}
