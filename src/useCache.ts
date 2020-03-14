import useSSR from 'use-ssr'
import { invariant, toResponseObject, tryGetData } from './utils'
import { Cache } from './types'
import { defaults } from './useFetchArgs'

const cacheName = 'useHTTPcache'

const getCache = () => {
  try {
    return JSON.parse(localStorage[cacheName] || '{}')
  } catch (err) {
    localStorage.removeItem(cacheName)
    return {}
  }
}

const inMemoryStorage = new Map<string, Response | number>()
const getMemoryStorage = ({ cacheLife }: { cacheLife: number }): Cache => ({
  async get(name: string) {
    const item = inMemoryStorage.get(name) as Response | undefined
    if (!item) return

    const expiration = inMemoryStorage.get(`${name}:ts`)
    if (expiration && expiration > 0 && expiration < Date.now()) {
      inMemoryStorage.delete(name)
      inMemoryStorage.delete(`${name}:ts`)
      return
    }

    return item
  },
  async set(name: string, data: Response) {
    inMemoryStorage.set(name, data)
    inMemoryStorage.set(`${name}:ts`, cacheLife > 0 ? Date.now() + cacheLife : 0)
  },
  async has(name: string) {
    return inMemoryStorage.has(name)
  },
  async delete(name: string) {
    inMemoryStorage.delete(name)
    inMemoryStorage.delete(`${name}:ts`)
  }
})

const getLocalStorage = ({ cacheLife }: { cacheLife: number }): Cache => {
  // there isn't state here now, but will be eventually

  const remove = async (name: string) => {
    const cache = getCache()
    delete cache[name]
    localStorage.setItem(cacheName, JSON.stringify(cache))
  }

  const has = async (responseID: string): Promise<boolean> => {
    const cache = getCache()
    return !!(cache[responseID] && cache[responseID].response)
  }

  const get = async (responseID: string): Promise<Response | undefined> => {
    const cache = getCache()
    if (!cache[responseID]) {
      return
    }

    const { expiration, response: { body, headers, status, statusText } } = cache[responseID] as any
    if (expiration < Date.now()) {
      delete cache[name]
      localStorage.setItem(cacheName, JSON.stringify(cache))
      return
    }

    return new Response(body, {
      status,
      statusText,
      headers: new Headers(headers || {})
    })
  }

  const set = async (responseID: string, response: Response): Promise<void> => {
    const cache = getCache()
    const responseObject = toResponseObject(response, await tryGetData(response, defaults.data))
    cache[responseID] = {
      response: responseObject,
      expiration: Date.now() + cacheLife
    }
    localStorage.setItem(cacheName, JSON.stringify(cache))
  }

  return { get, set, has, delete: remove }
}

/**
 * Eventually, this will be replaced by use-react-storage, so
 * having this as a hook allows us to have minimal changes in
 * the future when switching over.
 */
type UseCacheArgs = { persist: boolean, cacheLife: number }
const useCache = ({ persist, cacheLife }: UseCacheArgs): Cache => {
  const { isNative, isServer, isBrowser } = useSSR()
  invariant(!(isServer && persist), 'There is no persistant storage on the Server currently! 🙅‍♂️')
  invariant(!(isNative && !isServer && !isBrowser), 'React Native support is not yet implemented!')

  // right now we're not worrying about react-native
  if (persist) return getLocalStorage({ cacheLife: cacheLife || (24 * 3600000) })
  return getMemoryStorage({ cacheLife })
}

export default useCache
