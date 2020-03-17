import useSSR from 'use-ssr'
import { invariant } from './utils'
import { Cache, CachePolicies } from './types'

import getLocalStorage from './storage/localStorage'
import getMemoryStorage from './storage/memoryStorage'

const { NETWORK_ONLY, NO_CACHE } = CachePolicies
/**
 * Eventually, this will be replaced by use-react-storage, so
 * having this as a hook allows us to have minimal changes in
 * the future when switching over.
 */
type UseCacheArgs = { persist: boolean, cacheLife: number, cachePolicy: CachePolicies }
const useCache = ({ persist, cacheLife, cachePolicy }: UseCacheArgs): Cache => {
  const { isNative, isServer } = useSSR()
  invariant(!(isServer && persist), 'There is no persistent storage on the Server currently! 🙅‍♂️')
  invariant(!(isNative && persist), 'React Native support for persistent cache is not yet implemented. 🙅‍♂️')
  invariant(!(persist && [NO_CACHE, NETWORK_ONLY].includes(cachePolicy)), `You cannot use option 'persist' with cachePolicy: ${cachePolicy} 🙅‍♂️`)

  // right now we're not worrying about react-native
  if (persist) return getLocalStorage({ cacheLife: cacheLife || (24 * 3600000) })
  return getMemoryStorage({ cacheLife })
}

export default useCache
