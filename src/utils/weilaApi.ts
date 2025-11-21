import { getRootUrl } from '@kvoon/utils'
import { WeilaApi } from '@wl/network'
import { appid, appkey } from '~/composables/useWeilaFetch'

export const weilaApi = new WeilaApi(
  appid.value,
  appkey.value,
  {
    baseURL: `${getRootUrl(window.location.href)}/v2`,
  },
)
