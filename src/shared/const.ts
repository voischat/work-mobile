export const appid = computed(() => {
  return import.meta.env.VITE_APP_ID || '102065'
})

export const appkey = computed(() => {
  return import.meta.env.VITE_APP_KEY || '3c227f2cbc2084ebdd9617fd283c42c7'
})

export const isLimitedWebview = ref(false)
