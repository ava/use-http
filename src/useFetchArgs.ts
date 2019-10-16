import { OptionsMaybeURL, NoUrlOptions, Interceptors, Flatten } from './types'
import { isString, isObject, invariant, pullOutRequestInit } from './utils'
import { useContext, useMemo } from 'react'
import useSSR from 'use-ssr'
import FetchContext from './FetchContext'

type UseFetchArgsReturn = {
  customOptions: {
    onMount: boolean
    onUpdate: any[]
    retries: number
    timeout: number
    path: string
    url: string
    interceptors: Interceptors
    onAbort: () => void
    onTimeout: () => void
  },
  requestInit: RequestInit
  defaults: {
    loading: boolean
    data?: any
  },
}

export const useFetchArgsDefaults = {
  customOptions: {
    onMount: false,
    onUpdate: [],
    retries: 0,
    timeout: 30000, // 30 seconds
    path: '',
    url: '',
    interceptors: {},
    onAbort: () => {},
    onTimeout: () => {}
  },
  requestInit: {
    headers: {
      // default content types http://bit.ly/2N2ovOZ
      // Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  },
  defaults: {
    data: undefined,
    loading: false,
  }
}

const defaults = Object.values(useFetchArgsDefaults).reduce((a, o) => ({ ...a, ...o }), {} as Flatten<UseFetchArgsReturn>)

export default function useFetchArgs(
  urlOrOptions?: string | OptionsMaybeURL,
  optionsNoURLs?: NoUrlOptions,
): UseFetchArgsReturn {
  const context = useContext(FetchContext)
  const { isServer } = useSSR()

  invariant(
    !(isObject(urlOrOptions) && isObject(optionsNoURLs)),
    'You cannot have a 2nd parameter of useFetch when your first argument is an object config.',
  )

  const url = useMemo((): string => {
    if (isString(urlOrOptions) && urlOrOptions) return urlOrOptions as string
    if (isObject(urlOrOptions) && !!urlOrOptions.url) return urlOrOptions.url
    if (context.url) return context.url
    return defaults.url
  }, [context.url, urlOrOptions])

  invariant(
    !!url,
    'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>',
  )

  const onMount = useField<boolean>('onMount', urlOrOptions, optionsNoURLs)
  const onUpdate = useField<[]>('onUpdate', urlOrOptions, optionsNoURLs)
  const data = useField('data', urlOrOptions, optionsNoURLs)
  const path = useField<string>('path', urlOrOptions, optionsNoURLs)
  const timeout = useField<number>('timeout', urlOrOptions, optionsNoURLs)
  const retries = useField<number>('retries', urlOrOptions, optionsNoURLs)
  const onAbort = useField<() => void>('onAbort', urlOrOptions, optionsNoURLs)
  const onTimeout = useField<() => void>('onTimeout', urlOrOptions, optionsNoURLs)

  const loading = useMemo((): boolean => {
    if (isServer) return true
    if (isObject(urlOrOptions)) return !!urlOrOptions.loading || !!urlOrOptions.onMount
    if (isObject(optionsNoURLs)) return !!optionsNoURLs.loading || !!optionsNoURLs.onMount
    return defaults.loading
  }, [urlOrOptions, optionsNoURLs])

  const interceptors = useMemo((): Interceptors => {
    const contextInterceptors = context.options && context.options.interceptors || {}
    const final: Interceptors  = { ...contextInterceptors }
    if (isObject(urlOrOptions) && isObject(urlOrOptions.interceptors)) {
      if (urlOrOptions.interceptors.request) final.request = urlOrOptions.interceptors.request
      if (urlOrOptions.interceptors.response) final.response = urlOrOptions.interceptors.response
    }
    if (isObject(optionsNoURLs) && isObject(optionsNoURLs.interceptors)) {
      if (optionsNoURLs.interceptors.request) final.request = optionsNoURLs.interceptors.request
      if (optionsNoURLs.interceptors.response) final.response = optionsNoURLs.interceptors.response
    }
    return final
  }, [urlOrOptions, optionsNoURLs])

  const requestInit = useMemo((): RequestInit => {
    const contextRequestInit = pullOutRequestInit(context.options as OptionsMaybeURL)

    const requestInitOptions = isObject(urlOrOptions)
      ? urlOrOptions
      : isObject(optionsNoURLs)
      ? optionsNoURLs
      : {}

    const requestInit = pullOutRequestInit(requestInitOptions)

    return {
      ...useFetchArgsDefaults.requestInit,
      ...contextRequestInit,
      ...requestInit,
      headers: {
        ...defaults.headers,
        ...contextRequestInit.headers,
        ...requestInit.headers,
      },
    }
  }, [urlOrOptions, optionsNoURLs])

  return {
    customOptions: {
      url,
      onMount,
      onUpdate,
      path,
      interceptors,
      timeout,
      retries,
      onAbort,
      onTimeout
    },
    requestInit,
    defaults: {
      data, 
      loading
    }
  }
}

const useField = <DV = any>(
  field: keyof OptionsMaybeURL | keyof NoUrlOptions,
  urlOrOptions?: string | OptionsMaybeURL,
  optionsNoURLs?: NoUrlOptions
) => {
  const context = useContext(FetchContext)
  const contextOptions = context.options || {}
  return useMemo((): DV => {
    if (isObject(urlOrOptions) && urlOrOptions[field]) return urlOrOptions[field]
    if (isObject(optionsNoURLs) && optionsNoURLs[field as keyof NoUrlOptions]) return optionsNoURLs[field as keyof NoUrlOptions]
    if (contextOptions[field]) return  contextOptions[field]
    return defaults[field]
  }, [urlOrOptions, optionsNoURLs])
}