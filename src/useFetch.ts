/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { HTTPMethod, Options, OptionsMaybeURL, UseFetch, FetchCommands, DestructuringCommands, UseFetchResult } from './types'
import { BodyOnly, RouteAndBodyOnly, RouteOnly, FetchData, NoArgs, NoUrlOptions } from './types'
import useCustomOptions from './useCustomOptions'
import useRequestInit from './useRequestInit'
import useSSR from 'use-ssr'
import makeRouteAndOptions from './makeRouteAndOptions';

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
  const { isBrowser } = useSSR()
  const { onMount, url } = useCustomOptions(urlOrOptions, optionsNoURLs)
  let requestInit = useRequestInit(urlOrOptions, optionsNoURLs)

  let controller = useRef<AbortController | null>()
  let data = useRef<TData>()

  // TODO: default config object should handle this
  const [loading, setLoading] = useState(onMount || false)
  const [error, setError] = useState<any>()

  const makeFetch = useCallback((method: HTTPMethod): FetchData => {
    return async (routeOrBody?: string | BodyInit | object, body?: BodyInit | object): Promise<any> => {
      controller.current = isBrowser ? new AbortController() : null
      const { route, options } = makeRouteAndOptions(requestInit, method, controller, routeOrBody, body)
      try {
        setLoading(true)
        const response = await fetch(`${url}${route}`, options)
        try {
          data.current = await response.json()
        } catch (err) {
          data.current = await response.text() as any // FIXME: should not be `any` type
        }
      } catch (err) {
        if (err.name !== 'AbortError') setError(err)
      } finally {
        controller.current = null
        setLoading(false)
      }
      return data.current
    }
  }, [url, isBrowser, requestInit])

  const get = useCallback(makeFetch(HTTPMethod.GET), [])
  const post = useCallback(makeFetch(HTTPMethod.POST), [])
  const patch = useCallback(makeFetch(HTTPMethod.PATCH), [])
  const put = useCallback(makeFetch(HTTPMethod.PUT), [])
  const del = useCallback(makeFetch(HTTPMethod.DELETE), [])
  const query = useCallback((query: string, variables?: BodyInit | object): Promise<any> => post({ query, variables }), [post])
  const mutate = useCallback((mutation: string, variables?: BodyInit | object): Promise<any> => post({ mutation, variables }), [post])

  const abort = useCallback((): void => { controller.current && controller.current.abort() }, [])

  const request = useMemo(
    (): FetchCommands => ({ get, post, patch, put, del, delete: del, abort, query, mutate }),
    [get, post, patch, put, del, abort, query, mutate]
  )

  // handling onMount
  useEffect((): void => {
    if (!onMount) return
    const methodName = requestInit.method || HTTPMethod.GET;
    if (!!url && methodName !== HTTPMethod.GET) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as RouteAndBodyOnly
      req(url, requestInit.body as BodyInit)
    } else if (!url && methodName !== HTTPMethod.GET as string) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as BodyOnly
      req(requestInit.body as BodyInit)
    } else if (url) {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as RouteOnly
      req(url)
    } else {
      const req = request[methodName.toLowerCase() as keyof FetchCommands] as NoArgs
      req()
    }
  }, [onMount, requestInit.body, requestInit.method, request, url])

  return Object.assign<DestructuringCommands<TData>, UseFetchResult<TData>>(
    [data.current, loading, error, request],
    { data: data.current, loading, error, request, ...request }
  )
}

export { useFetch }
export default useFetch
