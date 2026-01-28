import { useI18n } from 'vue-i18n'
import { savedLocale } from '~/shared/states'

export function useLocale() {
  const { locale, availableLocales } = useI18n()

  function setLocale(newLocale: string): void {
    if (availableLocales.includes(newLocale)) {
      savedLocale.value = newLocale
    }
  }

  return {
    locale,
    setLocale,
    availableLocales,
  }
}
