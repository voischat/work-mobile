import { createStorage } from 'unstorage'
import localStorage from 'unstorage/drivers/localstorage'
import { name } from '../../package.json'

export const storageKey = (key: string) => `${name}:${key}`

export const storage = createStorage({
  driver: localStorage({
    base: name,
  }),
})
