import { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react'
import FetchContext from './FetchContext'
import { HTTPMethod, /* Options, */ UseFetch, FetchCommands, DestructuringCommands, UseFetchResult, useFetchArg1 } from "./types"
import { invariant, isObject, isString, pullOutRequestInit } from './utils'

type OptionsNoURLs = {
  onMount?: boolean,
  timeout?: number
} & RequestInit

// No Provider
type URLRequiredOptions = {
  url: string,
  onMount?: boolean,
  timeout?: number,
} & RequestInit

type BaseURLRequiredOptions = {
  baseUrl: string
  onMount?: boolean,
  timeout?: number,
} & RequestInit

type OptionsAsFirstParam = URLRequiredOptions | BaseURLRequiredOptions

// With Provider
type MaybeURLOptions = {
  url?: string,
  onMount?: boolean,
  timeout?: number,
} & RequestInit

type MaybeBaseURLOptions = {
  baseUrl?: string
  onMount?: boolean,
  timeout?: number,
} & RequestInit

type MaybeOptions = MaybeURLOptions | MaybeBaseURLOptions

// TODO: this is still yet to be implemented
type OptionsOverwriteWithContext = (options: MaybeOptions) => MaybeOptions

type OptionsAsFirstParamWithContext = MaybeOptions | OptionsOverwriteWithContext

// Putting it all together
type URLOrOptions = string | OptionsAsFirstParam | OptionsAsFirstParamWithContext

type Options = OptionsAsFirstParam | OptionsAsFirstParamWithContext | OptionsNoURLs

// No <Provider url='example.com' />
export function useFetch<TData = any>(url: string, options?: OptionsNoURLs): UseFetch<TData>
export function useFetch<TData = any>(options: OptionsAsFirstParam): UseFetch<TData>
// With <Provider url='example.com' />
// options should be extended. In future maybe have options callback to completely overwrite options
// i.e. useFetch('ex.com', oldOptions => ({ ...newOptions })) to overwrite
export function useFetch<TData = any>(url?: string, options?: OptionsNoURLs): UseFetch<TData>
export function useFetch<TData = any>(options?: OptionsAsFirstParamWithContext): UseFetch<TData>

export function useFetch<TData = any>(urlOrOptions?: URLOrOptions, optionsNoURLs?: OptionsNoURLs): UseFetch<TData> {
  const context = useContext(FetchContext)

  // TODO: this needs to be per initial setup below since we need to check urlOrOptions.url OR  urlOrOptions.baseUrl
  invariant(!!urlOrOptions && !!context.url, 'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')

  let url: string = ''
  let options: RequestInit = {}
  let onMount: boolean = false
  let timeout: number = 10 // TODO: not implemented
  let baseUrl: string = ''
  let method: HTTPMethod = HTTPMethod.GET

  const handleUseFetchOptions = useCallback((useFetchOptions?: UseFetchOptions): void => {
    const opts = useFetchOptions || {}
    if (opts.onMount) onMount = opts.onMount
    if (opts.timeout) timeout = opts.timeout
    if (opts.baseURL) baseUrl = opts.baseURL
    if (opts.url) url = opts.url
  }, [])

  // arg1 = url AND arg2 = options
  if (isString(urlOrOptions) && isObject(optionsNoURLs)) {
    url = urlOrOptions as string
    options = pullOutRequestInit(optionsNoURLs)
    // currenlty this should only set onMount or timeout
    handleUseFetchOptions(optionsNoURLs)
  // arg1 = url AND arg2 = undefined
  } else if (isString(urlOrOptions) && optionsNoURLs === undefined) {
    url = urlOrOptions as string
  // arg1 = options with baseURL and no URL
  // arg1 = options with URL and no baseURL
  } else if (isObject(urlOrOptions)) {
    invariant(!optionsNoURLs, 'You cannot have a 2nd parameter of useFetch when your first argument is a object config.')
    // I think the types should handle if a `url` and a `baseURL` are not set, TODO: make test for this
    // I also think it should handle if no `url` and no `baseURL` are set. TODO: make test for this
    // note on these^ could check with an invariant for both cases in `handleUseFetchOptions`
    options = pullOutRequestInit(urlOrOptions)
    handleUseFetchOptions(urlOrOptions)
  }
  // Provider: arg1 = undefined
  // Provider: arg1 = url (overwrites global url) AND arg2 = options (extend global options)
  // Provider: arg1 = url (overwrites global url) AND arg2 = undefined
  // Provider: arg1 = options (updates global options) - overwrites URL and no baseURL
  // Provider: arg1 = options (updates global options) - overwrites baseURL and no URL
  // Provider: arg1 = options (updates global options) - overwrites any other field
  // TODO - Provider: arg1 = oldGlobalOptions => ({ my: 'new local options'}) (overwrite all global options for this instance of useFetch)
  const handleOptions = useCallback((opts: Options & RequestInit) => {
    if (true) {
      // take out all the things that are not normal `fetch` options
      // need to take this out of scope so can set the variables below correctly
      let { url, onMount, timeout, baseUrl, ...rest } = opts
      options = { signal: undefined, ...rest }
    }
    if (context.url) url = context.url
    if (opts.url) url = opts.url || context.url || ''
    if (opts.onMount) onMount = opts.onMount
    if (opts.method) method = opts.method
    if (opts.baseUrl) baseUrl = opts.baseUrl
  }, [])

  if (typeof arg1 === 'string') {
    // if we have a default url from context, and
    // arg1 is a string, and we're not using graphql
    // we treat arg1 as a relative route
    url = context.url && !context.graphql ? context.url + arg1 : arg1

    if (arg2 && isObject(arg2)) handleOptions(arg2)

  } else if (isObject(arg1)) {
    handleOptions(arg1 || {})
  }

  const [data, setData] = useState<TData>()
  const [loading, setLoading] = useState(onMount)
  const [error, setError] = useState<any>()
  const controller = useRef<AbortController | null>()

  const fetchData = useCallback(
    (method: string) => async (fetchArg1?: object | string, fetchArg2?: object | string) => {
      if ('AbortController' in window) {
        controller.current = new AbortController()
        options.signal = controller.current.signal
      }

      let query = ''
      // post | patch | put | etc.
      if (isObject(fetchArg1) && method.toLowerCase() !== 'get') {
        options.body = JSON.stringify(fetchArg1)

      // relative routes
      } else if (baseUrl && typeof fetchArg1 === 'string') {
        url = baseUrl + fetchArg1
        if (isObject(fetchArg2)) options.body = JSON.stringify(fetchArg2)
      }
      if (typeof fetchArg1 === 'string' && typeof fetchArg2 === 'string') query = fetchArg2

      try {
        setLoading(true)
        const response = await fetch(url + query, {
          method,
          ...context.options,
          ...options,
          headers: {
            // default content types http://bit.ly/2N2ovOZ
            Accept: 'application/json', 
            'Content-Type': 'application/json',
            ...(context.options || {}).headers,
            ...options.headers
          }
        })
        let data = null
        try {
          data = await response.json()
        } catch (err) {
          data = await response.text()
        }
        setData(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err)
      } finally {
        controller.current = null
        setLoading(false)
      }
    },
    [url]
  )

  const get = useCallback(fetchData(HTTPMethod.GET), [])
  const post = useCallback(fetchData(HTTPMethod.POST), [])
  const patch = useCallback(fetchData(HTTPMethod.PATCH), [])
  const put = useCallback(fetchData(HTTPMethod.PUT), [])
  const del = useCallback(fetchData(HTTPMethod.DELETE), [])
  const query = useCallback((query?: string, variables?: object) => post({ query, variables }), [])
  const mutate = useCallback((mutation?: string, variables?: object) => post({ mutation, variables }), [])

  const abort = useCallback(() => {
    controller.current && controller.current.abort()
  }, [])

  const request: FetchCommands = useMemo(() => ({ get, post, patch, put, del, delete: del, abort, query, mutate }), [])

  useEffect(() => {
    const methodName = method.toLowerCase() as keyof typeof request
    if (onMount) request[methodName]()
  }, [])

  return Object.assign<DestructuringCommands<TData>, UseFetchResult<TData>>(
    [data, loading, error, request],
    { data, loading, error, request, ...request }
  )
}

export default useFetch
