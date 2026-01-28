export const isAtBottom = ref(false)

export const overrideFeatures = useLocalStorage<Record<string, boolean>>('devtools-override-features', {})
export const overrideEnvMode = useLocalStorage<'development' | 'intl' | 'production' | null>('devtools-override-env-mode', null)

export function getDefaultLocale(): string {
  const { isEnabled } = useFeatureFlags()

  if (!isEnabled('languageSwitching')) {
    console.log('disable')
    return 'zh-CN'
  }

  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  const browserLocale = browserLang.split('-')[0]

  if (browserLocale.startsWith('zh')) {
    return 'zh-CN'
  }

  return 'en'
}

export const savedLocale = useLocalStorage<string>('locale', getDefaultLocale(), {
  listenToStorageChanges: true,
})
