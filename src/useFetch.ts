import { useEffect, useState, useCallback, useRef } from 'react'
import {
  HTTPMethod,
  UseFetch,
  ReqMethods,
  Req,
  Res,
  UseFetchArrayReturn,
  UseFetchObjectReturn,
  UseFetchArgs
} from './types'
import { BodyOnly, FetchData, NoArgs } from './types'
import useCustomOptions from './useCustomOptions'
import useRequestInit from './useRequestInit'
import useSSR from 'use-ssr'
import makeRouteAndOptions from './makeRouteAndOptions'
import { isEmpty } from './utils'

// No <Provider url='example.com' />
// function useFetch<TData = any>(url: string, options?: NoUrlOptions): UseFetch<TData>
// function useFetch<TData = any>(options: Options): UseFetch<TData>
// With <Provider url='example.com' />
// options should be extended. In future maybe have options callback to completely overwrite options
// i.e. useFetch('ex.com', oldOptions => ({ ...newOptions })) to overwrite
// function useFetch<TData = any>(url?: string, options?: NoUrlOptions): UseFetch<TData>
// function useFetch<TData = any>(options?: OptionsMaybeURL): UseFetch<TData>

function useFetch<TData = any>(...args: UseFetchArgs): UseFetch<TData> {
  const { url, onMount, path, ...defaults } = useCustomOptions(...args)
  const requestInit = useRequestInit(...args)

  const { isBrowser, isServer } = useSSR()

  const controller = useRef<AbortController | null>()
  const res = useRef<Response>()
  const data = useRef<TData>(defaults.data)

  const [loading, setLoading] = useState(defaults.loading)
  const [error, setError] = useState<any>()

  const makeFetch = useCallback((method: HTTPMethod): FetchData => {
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

      let theData

      try {
        setLoading(true)
        if (error) setError(undefined)
        if (isServer) return // TODO: for now, we don't do anything on the server

        res.current = await fetch(`${url}${path}${route}`, options)

        try {
          theData = await res.current.json()
        } catch (err) {
          theData = (await res.current.text()) as any // FIXME: should not be `any` type
        }
      } catch (err) {
        if (err.name !== 'AbortError') setError(err)
      } finally {
        if (defaults.data && isEmpty(theData)) {
          data.current = defaults.data
        } else {
          data.current = theData
        }
        controller.current = null
        setLoading(false)
      }
      return data.current
    }
  }, [url, isBrowser, requestInit, isServer])

  const post = makeFetch(HTTPMethod.POST)
  const del = makeFetch(HTTPMethod.DELETE)

  const request: Req<TData> = {
    get: makeFetch(HTTPMethod.GET),
    post,
    patch: makeFetch(HTTPMethod.PATCH),
    put: makeFetch(HTTPMethod.PUT),
    del,
    delete: del,
    abort(): void {
      controller.current && controller.current.abort()
    },
    query: (query, variables) => post({ query, variables }),
    mutate: (mutation, variables) => post({ mutation, variables }),
    loading: loading as boolean,
    error,
    data: data.current,
  }

  const response = {
    data: data.current,
    ...res.current
  }

  // handling onMount
  const mounted = useRef(false)
  useEffect((): void => {
    if (!onMount || mounted.current) return
    mounted.current = true
    const methodName = requestInit.method || HTTPMethod.GET
    const methodLower = methodName.toLowerCase() as keyof ReqMethods
    if (methodName !== HTTPMethod.GET) {
      const req = request[methodLower] as BodyOnly
      req(requestInit.body as BodyInit)
    } else {
      const req = request[methodLower] as NoArgs
      req()
    }
  }, [onMount, requestInit.body, requestInit.method, url])

  return Object.assign<UseFetchArrayReturn<TData>, UseFetchObjectReturn<TData>>(
    [request, response as Res<TData>, loading as boolean, error],
    { request, response: response as Res<TData>, ...request },
  )
}

export { useFetch }
export default useFetch
