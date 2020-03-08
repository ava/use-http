const cacheName = 'useHTTPcache'

const hasPersistentData = (url: string): boolean => {
  const urlCache = JSON.parse(localStorage[cacheName] || '{}')
  return urlCache[url] && urlCache[url].timestamp > Date.now() - urlCache[url].ttl
}

const getPersistentData = (url: string): any => {
  const urlCache = JSON.parse(localStorage[cacheName] || '{}')
  return urlCache[url].data
}

const setPersistentData = (url: string, data: any, ttl = 24 * 3600000): void => {
  const urlCache = JSON.parse(localStorage[cacheName] || '{}')
  urlCache[url] = {
    url,
    data,
    timestamp: Date.now(),
    ttl
  }
  localStorage.setItem(cacheName, JSON.stringify(urlCache))
}

export {
  hasPersistentData,
  getPersistentData,
  setPersistentData
}
