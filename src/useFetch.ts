import { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react'
import FetchContext from './FetchContext'
import { HTTPMethod, Options, OptionsMaybeURL, UseFetch, FetchCommands, DestructuringCommands, UseFetchResult, NoArgs, NoUrlOptions } from './types'
import { BodyOnly, RouteAndBodyOnly, RouteOnly } from './types'
import { invariant, isObject, isString } from './utils'
import { makeConfig } from "./makeConfig";

export const useFetchDefaults: Partial<Options> = {
  onMount: false,

}

// No <Provider url='example.com' />
function useFetch<TData = any>(url: string, options?: NoUrlOptions): UseFetch<TData>
function useFetch<TData = any>(options: Options): UseFetch<TData>
// With <Provider url='example.com' />
// options should be extended. In future maybe have options callback to completely overwrite options
// i.e. useFetch('ex.com', oldOptions => ({ ...newOptions })) to overwrite
function useFetch<TData = any>(url?: string, options?: NoUrlOptions): UseFetch<TData>
function useFetch<TData = any>(options?: OptionsMaybeURL): UseFetch<TData>

// TODO: handle context.graphql
function useFetch<TData = any>(urlOrOptions?: string | OptionsMaybeURL, optionsNoURLs?: NoUrlOptions): UseFetch<TData> {
  const context = useContext(FetchContext)

  invariant(!!urlOrOptions || !!context.url, 'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')

  const options = makeConfig(context, urlOrOptions, optionsNoURLs)

  const { onMount, url } = options

  // Provider ex: useFetch({ url: 'https://url.com' }) -- (overwrites global url)
  // TODO - Provider: arg1 = oldGlobalOptions => ({ my: 'new local options'}) (overwrite all global options for this instance of useFetch)

  const [data, setData] = useState<TData>()
  // TODO: default config object should handle this
  const [loading, setLoading] = useState(onMount || false)
  const [error, setError] = useState<any>()
  const controller = useRef<AbortController | null>()

  const makeFetch = useCallback((method: HTTPMethod) => {
    if ('AbortController' in window) {
      controller.current = new AbortController()
      options.signal = controller.current.signal
    }
    let route = ''

    // POST, PATCH, PUT, DELETE
    async function doFetch(route?: string, body?: object): Promise<any>
    async function doFetch(body?: object): Promise<any>
    // GET
    async function doFetch(route?: string): Promise<any>

    async function doFetch(routeOrBody?: string | object, body?: object): Promise<any> {
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
        const response = await fetch(`${url}${route}`, {
          method,
          ...context.options,
          ...options,
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

  const abort = useCallback(() => {
    controller.current && controller.current.abort()
  }, [])

  const request: FetchCommands = useMemo(() => ({ get, post, patch, put, del, delete: del, abort, query, mutate }), [])

  // handling onMount
  useEffect(() => {
    if (!onMount) {
      return;
    }
    const methodName = options.method || HTTPMethod.GET;
    // const methodName = ((options.method || '') || HTTPMethod.GET).toUpperCase() as keyof FetchCommands
    if (!!url && methodName !== HTTPMethod.GET) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as RouteAndBodyOnly
      req(url, options.body as BodyInit)
    } else if (!url && methodName !== HTTPMethod.GET as string) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as BodyOnly
      req(options.body as BodyInit)
    } else if (!!url) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as RouteOnly
      req(url)
    } else {
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
