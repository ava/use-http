import { useEffect, useState, useCallback, useRef, useContext, useMemo, MutableRefObject } from 'react'
import FetchContext from './FetchContext'
import { HTTPMethod, Options, OptionsMaybeURL, UseFetch, FetchCommands, DestructuringCommands, UseFetchResult, NoArgs } from './types'
import { BodyOnly, RouteAndBodyOnly, RouteOnly } from './types'
import { invariant, isObject, isString, pullOutRequestInit } from './utils'
import useSSR from 'use-ssr'

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
  const { isBrowser } = useSSR()
  const context = useContext(FetchContext)

  invariant(!!urlOrOptions || !!context.url, 'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')

  let url: string = context.url || ''
  let { current: options }: MutableRefObject<RequestInit> = useRef({});
  let onMount: boolean = false
  // let timeout: number = 10 // TODO: not implemented

  const handleUseFetchOptions = useCallback((useFetchOptions?: OptionsMaybeURL) => {
    const opts = useFetchOptions || {} as Options
    if ('onMount' in opts) onMount = opts.onMount as boolean
    // if (opts.timeout) timeout = opts.timeout
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

  let { current: controller } = useRef<AbortController | null>()
  let { current: data } = useRef<TData>()
  const [loading, setLoading] = useState(onMount)
  const [error, setError] = useState<any>()
  const [, forceUpdate] = useState<null>(null)

  const makeFetch = useCallback((method: HTTPMethod) => {
    const opts = {
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
    }

    if (isBrowser && 'AbortController' in window) {
      controller = new AbortController()
      opts.signal = controller.signal
    }
    let route = ''

    // POST, PATCH, PUT, DELETE
    // async function doFetch(route?: string, body?: object): Promise<any>
    // async function doFetch(body?: object): Promise<any>
    // GET
    // async function doFetch(route?: string): Promise<any>

    async function doFetch(routeOrBody?: string | object, body?: object): Promise<any> {
      // TODO: do the ts types handle if routeOrBody AND body are both objects it will error?
      // if not, an invariant(!isObject(routeOrBody) && !isObject(body), 'both arguments cannot be an object')

      // POST, PATCH, PUT, DELETE
      if (method !== HTTPMethod.GET) { // TODO: add OPTIONS later
        // ex: request.post('/no', { freaking: 'way' })
        // ex: reqeust.post('/yes-way')
        if (isString(routeOrBody)) {
          route = routeOrBody as string;
          opts.body = JSON.stringify(body || {})
        // ex: request.post({ no: 'way' })
        } else if (isObject(routeOrBody)) {
          invariant(!body, `If first argument of ${method.toLowerCase()}() is an object, you cannot have a 2nd argument. 😜`)
          opts.body = JSON.stringify(routeOrBody || {})
        }
      // GET
      } else {
          invariant(!isObject(routeOrBody), 'Cannot pass a request body in a GET request')
          // ex: request.get('/no?freaking=way')
          // ex: request.get(new URLSearchParams('))
          if (isString(routeOrBody)) route = routeOrBody as string
          if (routeOrBody instanceof URLSearchParams) route + '?' + routeOrBody
      }

      if (routeOrBody instanceof URLSearchParams || routeOrBody instanceof FormData) {
        delete opts.headers['Content-Type']
      }

      try {
        setLoading(true)
        const response = await fetch(url + route, opts)
        try {
          data = await response.json()
        } catch (err) {
          data = await response.text() as any // FIXME: should not be `any` type
        }
        forceUpdate(null)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err)
      } finally {
        controller = null
        setLoading(false)
      }
      return data
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

  const abort = useCallback(() => { controller && controller.abort() }, [])

  const request: FetchCommands = useMemo(() => ({ get, post, patch, put, del, delete: del, abort, query, mutate }), [])

  // handling onMount
  useEffect(() => {
    const methodName = ((options.method || '') || HTTPMethod.GET).toUpperCase() as keyof FetchCommands
    if (!!url && onMount && methodName !== HTTPMethod.GET as string) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as RouteAndBodyOnly
      req(url, options.body as object)
    } else if (!url && onMount && methodName !== HTTPMethod.GET as string) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as BodyOnly
      req(options.body as object)
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
