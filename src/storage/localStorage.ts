import { serialiseResponse } from '../utils'
import { Cache } from '../types'

const cacheName = 'useHTTPcache'

const getCache = () => {
  try {
    return JSON.parse(localStorage.getItem(cacheName) || '{}')
  } catch (err) {
    localStorage.removeItem(cacheName)
    return {}
  }
}
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
      delete cache[responseID]
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
    const responseObject = await serialiseResponse(response)
    cache[responseID] = {
      response: responseObject,
      expiration: Date.now() + cacheLife
    }
    localStorage.setItem(cacheName, JSON.stringify(cache))
  }

  return { get, set, has, delete: remove }
}

export default getLocalStorage
