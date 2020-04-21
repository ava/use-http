import { Interceptors, OverwriteGlobalOptions, Options, IncomingOptions, UseFetchArgsReturn, CustomOptions } from './types'
import { isString, isObject, invariant, pullOutRequestInit, isFunction, isPositiveNumber } from './utils'
import { useContext, useMemo } from 'react'
import FetchContext from './FetchContext'
import defaults, { useFetchArgsDefaults } from './defaults'


export default function useFetchArgs(
  urlOrPathOrOptionsOrOverwriteGlobalOptions?: string | IncomingOptions | OverwriteGlobalOptions,
  optionsOrOverwriteGlobalOrDeps?: IncomingOptions | OverwriteGlobalOptions | any[],
  deps?: any[]
): UseFetchArgsReturn {
  invariant(
    !(isObject(urlOrPathOrOptionsOrOverwriteGlobalOptions) && isObject(optionsOrOverwriteGlobalOrDeps)),
    'You cannot have a 2nd parameter of useFetch as object when your first argument is an object.'
  )
  const context = useContext(FetchContext)

  const host = useMemo((): string => {
    const maybeHost = urlOrPathOrOptionsOrOverwriteGlobalOptions as string
    if (isString(maybeHost) && maybeHost.includes('://')) return maybeHost
    if (context.url) return context.url
    return defaults.host
  }, [context.url, urlOrPathOrOptionsOrOverwriteGlobalOptions])

  const path = useMemo((): string | null | undefined => {
    const maybePath = urlOrPathOrOptionsOrOverwriteGlobalOptions as string
    if (isString(maybePath) && !maybePath.includes('://')) return maybePath
    if (maybePath === null) return null
  }, [urlOrPathOrOptionsOrOverwriteGlobalOptions])

  const overwriteGlobalOptions = useMemo((): OverwriteGlobalOptions | undefined => {
    if (isFunction(urlOrPathOrOptionsOrOverwriteGlobalOptions)) return urlOrPathOrOptionsOrOverwriteGlobalOptions as OverwriteGlobalOptions
    if (isFunction(optionsOrOverwriteGlobalOrDeps)) return optionsOrOverwriteGlobalOrDeps as OverwriteGlobalOptions
  }, [])

  const options = useMemo(() => {
    let localOptions = { headers: {} } as IncomingOptions
    if (isObject(urlOrPathOrOptionsOrOverwriteGlobalOptions)) {
      localOptions = urlOrPathOrOptionsOrOverwriteGlobalOptions as IncomingOptions
    } else if (isObject(optionsOrOverwriteGlobalOrDeps)) {
      localOptions = optionsOrOverwriteGlobalOrDeps as IncomingOptions
    }
    let globalOptions = context.options
    const finalOptions = {
      ...defaults,
      ...globalOptions,
      ...localOptions,
      headers: {
        ...defaults.headers,
        ...globalOptions.headers,
        ...localOptions.headers
      } as Headers
    } as Options
    if (overwriteGlobalOptions) return overwriteGlobalOptions(finalOptions)
    return finalOptions
  }, [urlOrPathOrOptionsOrOverwriteGlobalOptions, overwriteGlobalOptions, context.options])

  const requestInit = useMemo(() => pullOutRequestInit(options), [options])

  const dependencies = useMemo((): any[] | undefined => {
    if (Array.isArray(optionsOrOverwriteGlobalOrDeps)) return optionsOrOverwriteGlobalOrDeps
    if (Array.isArray(deps)) return deps
    return defaults.dependencies
  }, [optionsOrOverwriteGlobalOrDeps, deps])

  const { cacheLife, retries, retryDelay, retryOn } = options
  invariant(Number.isInteger(cacheLife) && cacheLife >= 0, '`cacheLife` must be a number >= 0')
  invariant(Number.isInteger(retries) && retries >= 0, '`retries` must be a number >= 0')
  invariant(isFunction(retryDelay) || Number.isInteger(retryDelay as number) && retryDelay >= 0, '`retryDelay` must be a positive number or a function returning a positive number.')
  const isValidRetryOn = isFunction(retryOn) || (Array.isArray(retryOn) && retryOn.every(isPositiveNumber))
  invariant(isValidRetryOn, '`retryOn` must be an array of positive numbers or a function returning a boolean.')
  const loading = options.loading || Array.isArray(dependencies)

  const interceptors = useMemo((): Interceptors => {
    const final: Interceptors = {}
    if ('request' in options.interceptors) final.request = options.interceptors.request
    if ('response' in options.interceptors) final.response = options.interceptors.response
    return final
  }, [options])

  const customOptions = useMemo((): CustomOptions => {
    const customOptionKeys = Object.keys(useFetchArgsDefaults.customOptions) as (keyof CustomOptions)[] // Array<keyof CustomOptions> 
    const customOptions = customOptionKeys.reduce((opts, key) => {
      (opts as any)[key] = options[key]
      return opts
    }, {} as CustomOptions)
    return { ...customOptions, interceptors, loading }
  }, [interceptors, loading])

  return {
    host,
    path,
    customOptions,
    requestInit,
    dependencies
  }
}
