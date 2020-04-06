import { Flatten, CachePolicies, UseFetchArgsReturn } from './types'
import { isObject } from './utils'


export const useFetchArgsDefaults: UseFetchArgsReturn = {
  customOptions: {
    cacheLife: 0,
    cachePolicy: CachePolicies.CACHE_FIRST,
    interceptors: {},
    onAbort: () => { /* do nothing */ },
    onNewData: (currData: any, newData: any) => newData,
    onTimeout: () => { /* do nothing */ },
    path: '',
    perPage: 0,
    persist: false,
    retries: 0,
    retryDelay: 1000,
    retryOn: [],
    suspense: false,
    timeout: 0,
    url: '',
  },
  requestInit: {
    headers: {
      Accept: 'application/json, text/plain, */*'
    }
  },
  defaults: {
    data: undefined,
    loading: false
  },
  dependencies: undefined
}

export default Object.entries(useFetchArgsDefaults).reduce((acc, [key, value]) => {
  if (isObject(value)) return { ...acc, ...value }
  return { ...acc, [key]: value }
}, {} as Flatten<UseFetchArgsReturn>)
