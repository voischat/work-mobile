import { getRootUrl } from '@kvoon/utils'
import { createStorage } from 'unstorage'
import localStorage from 'unstorage/drivers/localstorage'
import { createWeilaFetch } from 'weila-auth'
import { name } from '../../package.json'

export const storage = createStorage({
  driver: localStorage({
    base: name,
  }),
})

export const weilaFetch = createWeilaFetch({
  appId: appid.value,
  appKey: appkey.value,
  baseURL: `${getRootUrl(window.location.href)}/v2`,
  storage,
})
