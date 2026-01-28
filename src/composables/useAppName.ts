import { useI18n } from 'vue-i18n'

export function useAppName() {
  const { t } = useI18n()
  const isIntlMode = import.meta.env.MODE === 'intl'

  const appName = computed(() => {
    return isIntlMode ? t('app.nameIntl') : t('app.name')
  })

  return {
    appName,
    isIntlMode,
  }
}
