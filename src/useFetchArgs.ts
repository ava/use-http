import { OptionsMaybeURL, NoUrlOptions, Flatten, CachePolicies, Interceptors, OverwriteGlobalOptions, Options } from './types'

import { isString, isObject, invariant, pullOutRequestInit, isFunction } from './utils'
import { useContext, useMemo } from 'react'
import FetchContext from './FetchContext'

type UseFetchArgsReturn = {
  customOptions: {
    retries: number
    timeout: number
    path: string
    url: string
    interceptors: Interceptors
    onAbort: () => void
    onTimeout: () => void
    onNewData: (currData: any, newData: any) => any
    perPage: number
    cachePolicy: CachePolicies
    cacheLife: number
  }
  requestInit: RequestInit
  defaults: {
    loading: boolean
    data?: any
  }
  dependencies?: any[]
}

export const useFetchArgsDefaults = {
  customOptions: {
    retries: 0,
    timeout: 30000, // 30 seconds
    path: '',
    url: '',
    interceptors: {},
    onAbort: () => {
      // do nothing
    },
    onTimeout: () => {
      // do nothing
    },
    onNewData: (currData: any, newData: any) => newData,
    perPage: 0,
    cachePolicy: CachePolicies.CACHE_FIRST,
    cacheLife: 0
  },
  requestInit: { headers: {} },
  defaults: {
    data: undefined,
    loading: false
  },
  dependencies: undefined
}

const defaults = Object.entries(useFetchArgsDefaults).reduce((acc, [key, value]) => {
  if (isObject(value)) return { ...acc, ...value }
  return { ...acc, [key]: value }
}, {} as Flatten<UseFetchArgsReturn>)

const useField = <DV = any>(
  field: keyof OptionsMaybeURL | keyof NoUrlOptions,
  urlOrOptions?: string | OptionsMaybeURL,
  optionsNoURLs?: NoUrlOptions | any[]
) => {
  const context = useContext(FetchContext)
  const contextOptions = context.options || {}
  return useMemo((): DV => {
    if (isObject(urlOrOptions) && urlOrOptions[field]) return urlOrOptions[field]
    if (isObject(optionsNoURLs) && (optionsNoURLs as NoUrlOptions)[field as keyof NoUrlOptions]) {
      return (optionsNoURLs as NoUrlOptions)[field as keyof NoUrlOptions]
    }
    if (contextOptions[field]) return contextOptions[field]
    return defaults[field]
  }, [urlOrOptions, field, optionsNoURLs, contextOptions])
}

export default function useFetchArgs (
  urlOrOptionsOrOverwriteGlobal?: string | OptionsMaybeURL | OverwriteGlobalOptions,
  optionsNoURLsOrOverwriteGlobalOrDeps?: NoUrlOptions | OverwriteGlobalOptions | any[],
  deps?: any[]
): UseFetchArgsReturn {
  const context = useContext(FetchContext)
  context.options = useMemo(() => {
    const overwriteGlobalOptions = (isFunction(urlOrOptionsOrOverwriteGlobal) ? urlOrOptionsOrOverwriteGlobal : isFunction(optionsNoURLsOrOverwriteGlobalOrDeps) && optionsNoURLsOrOverwriteGlobalOrDeps) as OverwriteGlobalOptions
    if (!overwriteGlobalOptions) return context.options
    // make a copy so we make sure not to modify the original context
    return overwriteGlobalOptions({ ...context.options } as Options)
  }, [context.options, optionsNoURLsOrOverwriteGlobalOrDeps, urlOrOptionsOrOverwriteGlobal])

  const urlOrOptions = urlOrOptionsOrOverwriteGlobal as string | OptionsMaybeURL
  const optionsNoURLs = optionsNoURLsOrOverwriteGlobalOrDeps as NoUrlOptions

  invariant(
    !(isObject(urlOrOptions) && isObject(optionsNoURLs)),
    'You cannot have a 2nd parameter of useFetch when your first argument is an object config.'
  )

  const url = useMemo((): string => {
    if (isString(urlOrOptions) && urlOrOptions) return urlOrOptions as string
    if (isObject(urlOrOptions) && !!urlOrOptions.url) return urlOrOptions.url
    if (context.url) return context.url
    return defaults.url
  }, [context.url, urlOrOptions])

  invariant(
    !!url,
    'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>'
  )

  const dependencies = useMemo((): any[] | undefined => {
    if (Array.isArray(optionsNoURLsOrOverwriteGlobalOrDeps)) return optionsNoURLsOrOverwriteGlobalOrDeps
    if (Array.isArray(deps)) return deps
    return defaults.dependencies
  }, [optionsNoURLsOrOverwriteGlobalOrDeps, deps])

  const data = useField('data', urlOrOptions, optionsNoURLs)
  const path = useField<string>('path', urlOrOptions, optionsNoURLs)
  const timeout = useField<number>('timeout', urlOrOptions, optionsNoURLs)
  const retries = useField<number>('retries', urlOrOptions, optionsNoURLs)
  const onAbort = useField<() => void>('onAbort', urlOrOptions, optionsNoURLs)
  const onTimeout = useField<() => void>('onTimeout', urlOrOptions, optionsNoURLs)
  const onNewData = useField<() => void>('onNewData', urlOrOptions, optionsNoURLs)
  const perPage = useField<number>('perPage', urlOrOptions, optionsNoURLs)
  const cachePolicy = useField<CachePolicies>('cachePolicy', urlOrOptions, optionsNoURLs)
  const cacheLife = useField<number>('cacheLife', urlOrOptions, optionsNoURLs)

  const loading = useMemo((): boolean => {
    if (isObject(urlOrOptions)) return !!urlOrOptions.loading || Array.isArray(dependencies)
    if (isObject(optionsNoURLs)) return !!optionsNoURLs.loading || Array.isArray(dependencies)
    return defaults.loading || Array.isArray(dependencies)
  }, [urlOrOptions, dependencies, optionsNoURLs])

  const interceptors = useMemo((): Interceptors => {
    const contextInterceptors = context.options && (context.options.interceptors || {})
    const final: Interceptors = { ...contextInterceptors }
    if (isObject(urlOrOptions) && isObject(urlOrOptions.interceptors)) {
      if (urlOrOptions.interceptors.request) final.request = urlOrOptions.interceptors.request
      if (urlOrOptions.interceptors.response) final.response = urlOrOptions.interceptors.response
    }
    if (isObject(optionsNoURLs) && isObject(optionsNoURLs.interceptors)) {
      if (optionsNoURLs.interceptors.request) final.request = optionsNoURLs.interceptors.request
      if (optionsNoURLs.interceptors.response) final.response = optionsNoURLs.interceptors.response
    }
    return final
  }, [context.options, urlOrOptions, optionsNoURLs])

  const requestInit = useMemo((): RequestInit => {
    const contextRequestInit = pullOutRequestInit(context.options as OptionsMaybeURL)

    const requestInitOptions = isObject(urlOrOptions)
      ? urlOrOptions
      : isObject(optionsNoURLs)
        ? optionsNoURLs
        : {}

    const requestInit = pullOutRequestInit(requestInitOptions)

    return {
      ...contextRequestInit,
      ...requestInit,
      headers: {
        ...contextRequestInit.headers,
        ...requestInit.headers
      }
    }
  }, [context.options, urlOrOptions, optionsNoURLs])

  return {
    customOptions: {
      url,
      path,
      interceptors,
      timeout,
      retries,
      onAbort,
      onTimeout,
      onNewData,
      perPage,
      cachePolicy,
      cacheLife
    },
    requestInit,
    defaults: {
      data,
      loading
    },
    dependencies
  }
}
