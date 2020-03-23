import { serializeResponse } from '../utils'
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
  const isExpired = (responseID: string) => {
    const cache = getCache()
    const { expiration, response } = (cache[responseID] || {})
    const expired = expiration > 0 && expiration < Date.now()
    if (expired) remove(responseID)
    return expired || !response
  }

  const remove = async (...responseIDs: string[]) => {
    const cache = getCache()
    responseIDs.forEach(id => delete cache[id])
    localStorage.setItem(cacheName, JSON.stringify(cache))
  }

  const has = async (responseID: string) => !isExpired(responseID)

  const get = async (responseID: string) => {
    const cache = getCache()
    if (isExpired(responseID)) return
    const { body, headers, status, statusText } = cache[responseID].response
    return new Response(body, {
      status,
      statusText,
      headers: new Headers(headers || {})
    })
  }

  const set = async (responseID: string, response: Response): Promise<void> => {
    const cache = getCache()
    cache[responseID] = {
      response: await serializeResponse(response),
      expiration: Date.now() + cacheLife
    }
    localStorage.setItem(cacheName, JSON.stringify(cache))
  }

  const clear = async () => {
    localStorage.setItem(cacheName, JSON.stringify({}))
  }

  return Object.defineProperties(getCache(), {
    get: { value: get, writable: false },
    set: { value: set, writable: false },
    has: { value: has, writable: false },
    delete: { value: remove, writable: false },
    clear: { value: clear, writable: false }
  })
}

export default getLocalStorage
