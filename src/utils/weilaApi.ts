import { getRootUrl } from '@kvoon/utils'
import { WeilaApi } from '@wl/network'
import { appid, appkey } from '~/shared/const'

export const weilaApi = new WeilaApi(
  'weila-work-webview',
  appid.value,
  appkey.value,
  {
    baseURL: `${getRootUrl(window.location.href)}/v2`,
  },
)
