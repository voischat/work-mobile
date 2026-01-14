import { getRootUrl } from '@kvoon/utils'
import { WeilaApi } from '@wl/network'

export const weilaApi = new WeilaApi(
  'weila-work-webview',
  appid.value,
  appkey.value,
  {
    baseURL: `${getRootUrl(window.location.href)}/v2`,
  },
)
