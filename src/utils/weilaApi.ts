import { getRootUrl } from '@kvoon/utils'
import { WeilaApi } from '@wl/network'

export const weilaApi = new WeilaApi(
  '102036',
  'b3c658bd2e637c65efb134fb381d4a18',
  {
    baseURL: `${getRootUrl(window.location.href)}/v2`,
  },
)
