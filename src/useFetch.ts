import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import {
  HTTPMethod,
  OptionsMaybeURL,
  UseFetch,
  FetchCommands,
  DestructuringCommands,
  UseFetchResult,
} from './types'
import {
  BodyOnly,
  FetchData,
  NoArgs,
  NoUrlOptions,
} from './types'
import useCustomOptions from './useCustomOptions'
import useRequestInit from './useRequestInit'
import useSSR from 'use-ssr'
import makeRouteAndOptions from './makeRouteAndOptions'

// No <Provider url='example.com' />
// function useFetch<TData = any>(url: string, options?: NoUrlOptions): UseFetch<TData>
// function useFetch<TData = any>(options: Options): UseFetch<TData>
// With <Provider url='example.com' />
// options should be extended. In future maybe have options callback to completely overwrite options
// i.e. useFetch('ex.com', oldOptions => ({ ...newOptions })) to overwrite
// function useFetch<TData = any>(url?: string, options?: NoUrlOptions): UseFetch<TData>
// function useFetch<TData = any>(options?: OptionsMaybeURL): UseFetch<TData>

// TODO: handle context.graphql
function useFetch<TData = any>(
  urlOrOptions?: string | OptionsMaybeURL,
  optionsNoURLs?: NoUrlOptions,
): UseFetch<TData> {
  const { isBrowser, isServer } = useSSR()
  const { onMount, url } = useCustomOptions(urlOrOptions, optionsNoURLs)
  const requestInit = useRequestInit(urlOrOptions, optionsNoURLs)

  const controller = useRef<AbortController | null>()
  const data = useRef<TData>()

  const [loading, setLoading] = useState(onMount || false)
  const [error, setError] = useState<any>()

  const makeFetch = useCallback(
    (method: HTTPMethod): FetchData => {
      return async (
        routeOrBody?: string | BodyInit | object,
        body?: BodyInit | object,
      ): Promise<any> => {
        controller.current = isBrowser ? new AbortController() : null
        const { route, options } = makeRouteAndOptions(
          requestInit,
          method,
          controller,
          routeOrBody,
          body,
        )

        try {
          setLoading(true)
          if (isServer) return // TODO: for now, we don't do anything on the server

          const response = await fetch(`${url}${route}`, options)
          try {
            data.current = await response.json()
          } catch (err) {
            data.current = (await response.text()) as any // FIXME: should not be `any` type
          }
        } catch (err) {
          if (err.name !== 'AbortError') setError(err)
        } finally {
          controller.current = null
          setLoading(false)
        }
        return data.current
      }
    },
    [
      /* url, isBrowser, requestInit, isServer */
    ],
  )

  const get = useCallback(makeFetch(HTTPMethod.GET), [])
  const post = useCallback(makeFetch(HTTPMethod.POST), [])
  const patch = useCallback(makeFetch(HTTPMethod.PATCH), [])
  const put = useCallback(makeFetch(HTTPMethod.PUT), [])
  const del = useCallback(makeFetch(HTTPMethod.DELETE), [])
  const query = useCallback(
    (query: string, variables?: BodyInit | object): Promise<any> =>
      post({ query, variables }),
    [post],
  )
  const mutate = useCallback(
    (mutation: string, variables?: BodyInit | object): Promise<any> =>
      post({ mutation, variables }),
    [post],
  )

  const abort = useCallback((): void => {
    controller.current && controller.current.abort()
  }, [])

  const request = useMemo(
    (): FetchCommands => ({
      get,
      post,
      patch,
      put,
      del,
      delete: del,
      abort,
      query,
      mutate,
    }),
    [get, post, patch, put, del, abort, query, mutate],
  )

  // handling onMount
  useEffect((): void => {
    if (!onMount) return
    const methodName = requestInit.method || HTTPMethod.GET
    const methodLower = methodName.toLowerCase() as keyof FetchCommands
    if (methodName !== HTTPMethod.GET) {
      const req = request[methodLower] as BodyOnly
      req(requestInit.body as BodyInit)
    } else {
      const req = request[methodLower] as NoArgs
      req()
    }
  }, [
    /*onMount, requestInit.body, requestInit.method, request, url*/
  ])

  return Object.assign<DestructuringCommands<TData>, UseFetchResult<TData>>(
    [data.current, loading, error, request],
    { data: data.current, loading, error, request, ...request },
  )
}

export { useFetch }
export default useFetch
