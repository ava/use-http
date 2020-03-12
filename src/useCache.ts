import useSSR from 'use-ssr'
import { invariant, toResponseObject } from "./utils"

const cacheName = 'useHTTPcache'

const getCache = () => {
  try {
    return JSON.parse(localStorage[cacheName] || '{}')
  } catch (err) {
    localStorage.removeItem(cacheName)
    return {}
  }
}


/**
 * Eventually, this will be replaced by use-react-storage, so
 * having this as a hook allows us to have minimal changes in
 * the future when switching over.
 */
type UseCacheArgs = { persist: boolean, cacheLife: number }
const inMemoryCache = new Map()
const useCache = ({ persist, cacheLife }: UseCacheArgs) => {
  const { isNative, isServer, isBrowser } = useSSR()
  invariant(!(isServer && persist), 'There is no persistant storage on the Server currently! 🙅‍♂️')
  invariant(!(isNative && !isServer && !isBrowser), 'React Native support is not yet implemented!')

  // right now we're not worrying about react-native
  if (persist) return useLocalStorage({ cacheLife })
  return inMemoryCache
}

const useLocalStorage = ({ cacheLife }: { cacheLife: number }) => {
  // there isn't state here now, but will be eventually

  const has = async (responseID: string): Promise<boolean> => {
    const cache = getCache()
    return !!(cache[responseID] && cache[responseID].response)
  }

  const get = async (responseID: string): Promise<any> => {
    const cache = getCache()
    const { body, headers, status, statusText } = (cache[responseID] ? cache[responseID].response : {}) as any
    return new Response(body, {
      status,
      statusText,
      headers: new Headers(headers || {})
    })
  }

  const set = async (responseID: string, response: Response): Promise<void> => {
    const cache = getCache()
    cache[responseID] = {
      response: toResponseObject(response),
      timestamp: Date.now(),
      ttl: cacheLife || 24 * 3600000
    }
    localStorage.setItem(cacheName, JSON.stringify(cache))
  }

  const remove = async (...responseIDs: string[]) => {
    const cache = getCache()
    responseIDs.forEach(id => delete cache[id])
    localStorage.setItem(cacheName, cache)
  }

  return { get, set, has, delete: remove }
}

export default useCache