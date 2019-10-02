import { OptionsMaybeURL, NoUrlOptions, Interceptors } from './types'
import { isString, isObject, invariant } from './utils'
import { useContext, useMemo } from 'react'
import useSSR from 'use-ssr'
import FetchContext from './FetchContext'

// Provider ex: useFetch({ url: 'https://url.com' }) -- (overwrites global url)
// TODO - Provider: arg1 = oldGlobalOptions => ({ my: 'new local options'}) (overwrite all global options for this instance of useFetch)

type UseCustomOptions = {
  onMount: boolean
  // timeout: number
  path: string
  url: string
  loading: boolean
  data?: any
  interceptors: Interceptors
}
/**
 * Handles all special options.
 * Ex: (+ means not implemented)
 * - url
 * - onMount
 * + timeout
 * + retry - amount of times it will retry
 * + retryDuration - interval at which each retry is done
 */
export default function useCustomOptions(
  urlOrOptions?: string | OptionsMaybeURL,
  optionsNoURLs?: NoUrlOptions,
): UseCustomOptions {
  const context = useContext(FetchContext)
  const contextInterceptors = context.options && context.options.interceptors || {}
  const { isServer } = useSSR()

  invariant(
    !(isObject(urlOrOptions) && isObject(optionsNoURLs)),
    'You cannot have a 2nd parameter of useFetch when your first argument is an object config.',
  )

  const url = useMemo((): string => {
    if (isString(urlOrOptions) && urlOrOptions) return urlOrOptions as string
    if (isObject(urlOrOptions) && !!urlOrOptions.url) return urlOrOptions.url
    if (context.url) return context.url
    return ''
  }, [context.url, urlOrOptions])

  invariant(
    !!url,
    'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>',
  )

  const onMount = useMemo((): boolean => {
    if (isObject(urlOrOptions)) return !!urlOrOptions.onMount
    if (isObject(optionsNoURLs)) return !!optionsNoURLs.onMount
    return false
  }, [urlOrOptions, optionsNoURLs])

  const loading = useMemo((): boolean => {
    if (isServer) return true
    if (isObject(urlOrOptions)) return !!urlOrOptions.loading || !!urlOrOptions.onMount
    if (isObject(optionsNoURLs)) return !!optionsNoURLs.loading || !!optionsNoURLs.onMount
    return false
  }, [urlOrOptions, optionsNoURLs])

  const data = useMemo((): any => {
    if (isObject(urlOrOptions)) return urlOrOptions.data
    if (isObject(optionsNoURLs)) return optionsNoURLs.data
  }, [urlOrOptions, optionsNoURLs])

  const path = useMemo((): string => {
    if (isObject(urlOrOptions) && urlOrOptions.path) return urlOrOptions.path as string
    if (isObject(optionsNoURLs) && optionsNoURLs.path) return optionsNoURLs.path as string
    return ''
  }, [urlOrOptions, optionsNoURLs])

  const interceptors = useMemo((): Interceptors => {
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

  return { url, onMount, loading, data, path, interceptors }
}
