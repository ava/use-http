const cacheName = 'useHTTPcache'

const getCache = () => {
  try {
    return JSON.parse(localStorage[cacheName] || '{}')
  } catch (err) {
    localStorage.removeItem(cacheName)
    return {}
  }
}

const hasItem = (url: string): boolean => {
  const urlCache = getCache()
  return urlCache[url] && urlCache[url].timestamp > Date.now() - urlCache[url].ttl
}

const getItem = (url: string): any => {
  const urlCache = getCache()
  return urlCache[url] && urlCache[url].data
}

const setItem = (url: string, data: any, ttl = 24 * 3600000): void => {
  const urlCache = getCache()
  urlCache[url] = {
    url,
    data,
    timestamp: Date.now(),
    ttl
  }
  localStorage.setItem(cacheName, JSON.stringify(urlCache))
}

export default {
  hasItem,
  getItem,
  setItem
}
