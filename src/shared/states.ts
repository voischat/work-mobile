export const isAtBottom = ref(false)

export const overrideFeatures = ref<Record<string, boolean>>({})
export const overrideEnvMode = ref<'development' | 'intl' | 'production' | null>(null)
