const cacheName = 'useHTTPcache'

const getCache = () => {
  try {
    return JSON.parse(localStorage[cacheName] || '{}')
  } catch (err) {
    localStorage.removeItem(cacheName)
    return {}
  }
}

const hasItem = (url: string): Promise<boolean> => {
  const urlCache = getCache()
  return Promise.resolve(urlCache[url] && urlCache[url].timestamp > Date.now() - urlCache[url].ttl)
}

const getItem = (url: string): Promise<any> => {
  const urlCache = getCache()
  return Promise.resolve(urlCache[url] && urlCache[url].data)
}

const setItem = (url: string, data: any, ttl = 24 * 3600000): Promise<void> => {
  const urlCache = getCache()
  urlCache[url] = {
    url,
    data,
    timestamp: Date.now(),
    ttl
  }
  localStorage.setItem(cacheName, JSON.stringify(urlCache))
  return Promise.resolve()
}

export default {
  hasItem,
  getItem,
  setItem
}
