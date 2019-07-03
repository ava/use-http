import { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react'
import FetchContext from './FetchContext'
import { HTTPMethod, Options, OptionsMaybeURL, UseFetch, FetchCommands, DestructuringCommands, UseFetchResult, NoArgs } from './types'
import { BodyOnly, RouteAndBodyOnly, RouteOnly } from './types'
import { invariant, isObject, isString, pullOutRequestInit } from './utils'

// No <Provider url='example.com' />
function useFetch<TData = any>(url: string, options?: Omit<Options, 'url'>): UseFetch<TData>
function useFetch<TData = any>(options: Options): UseFetch<TData>
// With <Provider url='example.com' />
// options should be extended. In future maybe have options callback to completely overwrite options
// i.e. useFetch('ex.com', oldOptions => ({ ...newOptions })) to overwrite
function useFetch<TData = any>(url?: string, options?: Omit<Options, 'url'>): UseFetch<TData>
function useFetch<TData = any>(options?: OptionsMaybeURL): UseFetch<TData>

// TODO: handle context.graphql
function useFetch<TData = any>(urlOrOptions?: string | OptionsMaybeURL, optionsNoURLs?: Omit<Options, 'url'>): UseFetch<TData> {
  const context = useContext(FetchContext)

  invariant(!!urlOrOptions || !!context.url, 'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')

  let url: string = context.url || ''
  let options: RequestInit = {}
  let onMount: boolean = false
  // let timeout: number = 10 // TODO: not implemented

  const handleUseFetchOptions = useCallback((useFetchOptions?: OptionsMaybeURL): void => {
    const opts = useFetchOptions || {} as Options
    if ('onMount' in opts) onMount = opts.onMount as boolean
    // if (opts.timeout) timeout = opts.timeout
    if ('url' in context) url = context.url as string
    if ('url' in opts) url = opts.url as string
  }, [])

  // ex: useFetch('https://url.com', { onMount: true })
  if (isString(urlOrOptions) && isObject(optionsNoURLs)) {
    url = urlOrOptions as string
    options = pullOutRequestInit(optionsNoURLs)
    handleUseFetchOptions(optionsNoURLs)

  // ex: useFetch('https://url.com')
  } else if (isString(urlOrOptions) && optionsNoURLs === undefined) {
    url = urlOrOptions as string

  // ex: useFetch({ onMount: true }) OR useFetch({ url: 'https://url.com' })
  } else if (isObject(urlOrOptions)) {
    invariant(!optionsNoURLs, 'You cannot have a 2nd parameter of useFetch when your first argument is a object config.')
    let optsWithURL = urlOrOptions as Options
    invariant(!!context.url || !!optsWithURL.url, 'You have to either set a URL in your options config or set a global URL in your <Provider url="https://url.com"></Provider>')
    options = pullOutRequestInit(urlOrOptions)
    handleUseFetchOptions(urlOrOptions as OptionsMaybeURL)
  }
  // Provider ex: useFetch({ url: 'https://url.com' }) -- (overwrites global url)
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
            // Accept: 'application/json', 
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
  const query = useCallback((query: string, variables?: object) => post({ query, variables }), [])
  const mutate = useCallback((mutation: string, variables?: object) => post({ mutation, variables }), [])

  const abort = useCallback(() => {
    controller.current && controller.current.abort()
  }, [])

  const request: FetchCommands = useMemo(() => ({ get, post, patch, put, del, delete: del, abort, query, mutate }), [])

  // handling onMount
  useEffect(() => {
    const methodName = ((options.method || '') || HTTPMethod.GET).toUpperCase() as keyof FetchCommands
    if (!!url && onMount && methodName !== HTTPMethod.GET as string) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as RouteAndBodyOnly
      req(url, options.body as BodyInit)
    } else if (!url && onMount && methodName !== HTTPMethod.GET as string) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as BodyOnly
      req(options.body as BodyInit)
    } else if (!!url && onMount) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as RouteOnly
      req(url)
    } else if (onMount) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as NoArgs
      req()
    }
  }, [])

  return Object.assign<DestructuringCommands<TData>, UseFetchResult<TData>>(
    [data, loading, error, request],
    { data, loading, error, request, ...request }
  )
}

export { useFetch }
export default useFetch
