import { Flatten, CachePolicies, UseFetchArgsReturn } from './types'
import { isObject } from './utils'


export const useFetchArgsDefaults: UseFetchArgsReturn = {
  host: '',
  path: undefined,
  customOptions: {
    cacheLife: 0,
    cachePolicy: CachePolicies.CACHE_FIRST,
    interceptors: {},
    onAbort: () => { /* do nothing */ },
    onError: () => { /* do nothing */ },
    onNewData: (currData: any, newData: any) => newData,
    onTimeout: () => { /* do nothing */ },
    perPage: 0,
    persist: false,
    responseType: ['json', 'text', 'blob', 'arrayBuffer'],
    retries: 0,
    retryDelay: 1000,
    retryOn: [],
    skip: false,
    suspense: false,
    timeout: 0,
    // defaults
    data: undefined,
    loading: false
  },
  requestInit: {
    headers: {
      Accept: 'application/json, text/plain, */*'
    }
  },
  dependencies: undefined
}

export default Object.entries(useFetchArgsDefaults).reduce((acc, [key, value]) => {
  if (isObject(value)) return { ...acc, ...value }
  return { ...acc, [key]: value }
}, {} as Flatten<UseFetchArgsReturn>)
