export const isAtBottom = ref(false)

export const overrideFeatures = useLocalStorage<Record<string, boolean>>('devtools-override-features', {})
export const overrideEnvMode = useLocalStorage<'development' | 'intl' | 'production' | null>('devtools-override-env-mode', null)
