import { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react'
import FetchContext from './FetchContext'
import { HTTPMethod, /* Options, */ UseFetch, FetchCommands, DestructuringCommands, UseFetchResult } from './types'
import { OptionsNoURLs, OptionsAsFirstParam, OptionsAsFirstParamWithContext, URLOrOptions, UseFetchOptions } from './types'
import { invariant, isObject, isString, pullOutRequestInit } from './utils'

// type Options = OptionsAsFirstParam | OptionsAsFirstParamWithContext | OptionsNoURLs

// No <Provider url='example.com' />
function useFetch<TData = any>(url: string, options?: OptionsNoURLs): UseFetch<TData>
function useFetch<TData = any>(options: OptionsAsFirstParam): UseFetch<TData>
// With <Provider url='example.com' />
// options should be extended. In future maybe have options callback to completely overwrite options
// i.e. useFetch('ex.com', oldOptions => ({ ...newOptions })) to overwrite
function useFetch<TData = any>(url?: string, options?: OptionsNoURLs): UseFetch<TData>
function useFetch<TData = any>(options?: OptionsAsFirstParamWithContext): UseFetch<TData>

// TODO: handle context.graphql
function useFetch<TData = any>(urlOrOptions?: URLOrOptions, optionsNoURLs?: OptionsNoURLs): UseFetch<TData> {
  const context = useContext(FetchContext)

  // TODO: this needs to be per initial setup below since we need to check urlOrOptions.url OR  urlOrOptions.baseUrl
  invariant(!!urlOrOptions && !!context.url, 'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')

  let url: string = context.url || ''
  let options: RequestInit = {}
  let onMount: boolean = false
  // let timeout: number = 10 // TODO: not implemented
  // let baseURL: string = ''
  let method: HTTPMethod = HTTPMethod.GET

  const handleUseFetchOptions = useCallback((useFetchOptions?: UseFetchOptions): void => {
    const opts = useFetchOptions || {} as UseFetchOptions
    if ('onMount' in opts) onMount = opts.onMount as boolean
    // if (opts.timeout) timeout = opts.timeout
    // if ('baseURL' in opts) baseURL = opts.baseURL as string
    if ('url' in opts) url = opts.url as string
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
    // I think the types should handle if a `url` and a `baseURL` are both set, TODO: make test for this
    // I also think it should handle if a `url` and a `baseURL` are both not set. TODO: make test for this
    // note on these^ could check with an invariant for both cases in `handleUseFetchOptions`
    options = pullOutRequestInit(urlOrOptions)
    handleUseFetchOptions(urlOrOptions as OptionsAsFirstParam)
  
  // Provider: arg1 = undefined
  } else if (urlOrOptions === undefined) {
    invariant(!!context.url, 'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')
    url = context.url as string

  // Provider: arg1 = url (overwrites global url) AND arg2 = options (extend global options)
  } else if (isString(urlOrOptions) && isObject(optionsNoURLs)) {
    url = urlOrOptions as string
    options = pullOutRequestInit(optionsNoURLs)
    handleUseFetchOptions(optionsNoURLs)

  // Provider: arg1 = url (overwrites global url) AND arg2 = undefined
  } else if (isObject(urlOrOptions) && optionsNoURLs === undefined) {
    url = urlOrOptions as string

  // Provider: arg1 = options (updates global options) - overwrites URL and no baseURL
  // Provider: arg1 = options (updates global options) - overwrites baseURL and no URL
  // Provider: arg1 = options (updates global options) - overwrites any other field
  } else if (isObject(urlOrOptions)) {
    options = pullOutRequestInit(urlOrOptions)
    handleUseFetchOptions(optionsNoURLs)
  }
  // TODO - Provider: arg1 = oldGlobalOptions => ({ my: 'new local options'}) (overwrite all global options for this instance of useFetch)

  const [data, setData] = useState<TData>()
  const [loading, setLoading] = useState(onMount)
  const [error, setError] = useState<any>()
  const controller = useRef<AbortController | null>()

  const makeFetch = useCallback((method: HTTPMethod) => {
    if ('AbortController' in window) {
      controller.current = new AbortController()
      options.signal = controller.current.signal
    }
    let route = ''

    // POST, PATCH, PUT, DELETE
    async function doFetch(route?: string, body?: object): Promise<void>
    async function doFetch(body?: object): Promise<void>
    // GET
    async function doFetch(route?: string): Promise<void>

    async function doFetch(routeOrBody?: string | object, body?: object): Promise<void> {
      // TODO: do the ts types handle if routeOrBody AND body are both objects it will error?
      // if not, an invariant(!isObject(routeOrBody) && !isObject(body), 'both arguments cannot be an object')

      // POST, PATCH, PUT, DELETE
      if (method !== HTTPMethod.GET) { // TODO: add OPTIONS later
        // ex: request.post('/no', { freaking: 'way' })
        // ex: reqeust.post('/yes-way')
        if (isString(routeOrBody)) {
          route = routeOrBody as string;
          options.body = JSON.stringify(body || {})
        // ex: request.post({ no: 'way' })
        } else if (isObject(routeOrBody)) {
          invariant(!body, `If first argument of ${method.toLowerCase()}() is an object, you cannot have a 2nd argument. 😜`)
          options.body = JSON.stringify(routeOrBody || {})
        }
      // GET
      } else {
          invariant(!isObject(routeOrBody), 'Cannot pass a request body in a GET request')
          // ex: request.get('/no?freaking=way')
          if (isString(routeOrBody)) route = routeOrBody as string
      }
      try {
        setLoading(true)
        const response = await fetch(url + route, {
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
    }

    return doFetch
  }, [url])

  const get = useCallback(makeFetch(HTTPMethod.GET), [])
  const post = useCallback(makeFetch(HTTPMethod.POST), [])
  const patch = useCallback(makeFetch(HTTPMethod.PATCH), [])
  const put = useCallback(makeFetch(HTTPMethod.PUT), [])
  const del = useCallback(makeFetch(HTTPMethod.DELETE), [])
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
