export const appid = computed(() => {
  return import.meta.env.VITE_APP_ID || '102065'
})

export const appkey = computed(() => {
  return import.meta.env.VITE_APP_KEY || '3c227f2cbc2084ebdd9617fd283c42c7'
})

export const AMapKeys = {
  js: '590d2eef2313b156f80a2936df9babad',
  secert: 'cdc03a7b9de2a9ca188da9ab76c4b450',
  regeo: '',
}

export const isLimitedWebview = ref(false)
