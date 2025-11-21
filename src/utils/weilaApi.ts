import { getRootUrl } from '@kvoon/utils'
import { WeilaApi } from '@wl/network'

export const appid = computed(() => {
  const demo = '102036'
  const normal = '102065'

  return (import.meta.env.DEV || import.meta.env.MODE === 'staging') ? demo : normal
})

export const appkey = computed(() => {
  const demo = 'b3c658bd2e637c65efb134fb381d4a18'
  const normal = '3c227f2cbc2084ebdd9617fd283c42c7'

  return (import.meta.env.DEV || import.meta.env.MODE === 'staging') ? demo : normal
})

export const weilaApi = new WeilaApi(
  appid.value,
  appkey.value,
  {
    baseURL: `${getRootUrl(window.location.href)}/v2`,
  },
)
