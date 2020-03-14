import useSSR from 'use-ssr'
import { invariant } from './utils'
import { Cache } from './types'

import getLocalStorage from './storage/localStorage'
import getMemoryStorage from './storage/memoryStorage'

/**
 * Eventually, this will be replaced by use-react-storage, so
 * having this as a hook allows us to have minimal changes in
 * the future when switching over.
 */
type UseCacheArgs = { persist: boolean, cacheLife: number }
const useCache = ({ persist, cacheLife }: UseCacheArgs): Cache => {
  const { isNative, isServer, isBrowser } = useSSR()
  invariant(!(isServer && persist), 'There is no persistant storage on the Server currently! 🙅‍♂️')
  invariant(!(isNative && !isServer && !isBrowser), 'React Native support for persistant cache is not yet implemented. 🙅‍♂️')

  // right now we're not worrying about react-native
  if (persist) return getLocalStorage({ cacheLife: cacheLife || (24 * 3600000) })
  return getMemoryStorage({ cacheLife })
}

export default useCache
