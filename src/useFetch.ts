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
import useFetchArgs from './useFetchArgs'
import useSSR from 'use-ssr'
import makeRouteAndOptions from './makeRouteAndOptions'
import { isEmpty, invariant } from './utils'

const responseMethods = ['clone', 'error', 'redirect', 'arrayBuffer', 'blob', 'formData', 'json', 'text']

const makeResponseProxy = (res = {}) => new Proxy(res, {
  get: (httpResponse: any, key: string) => {
    if (responseMethods.includes(key)) return () => httpResponse.current[key]()
    return (httpResponse.current || {})[key]
  }
})

function useFetch<TData = any>(...args: UseFetchArgs): UseFetch<TData> {
  const { customOptions, requestInit, defaults } = useFetchArgs(...args)
  const {
    url,
    onMount,
    onUpdate,
    path,
    interceptors,
    timeout,
    retries,
    onTimeout,
    onAbort,
  } = customOptions

  const { isServer } = useSSR()

  const controller = useRef<AbortController>()
  const res = useRef<Res<TData>>({} as Res<TData>)
  const data = useRef<TData>(defaults.data)
  const timedout = useRef(false)
  const attempts = useRef(retries)

  const [loading, setLoading] = useState(defaults.loading)
  const [error, setError] = useState<any>()

  const makeFetch = useCallback((method: HTTPMethod): FetchData => {
    
    const doFetch = async (
      routeOrBody?: string | BodyInit | object,
      body?: BodyInit | object,
    ): Promise<any> => {
      if (isServer) return // for now, we don't do anything on the server
      controller.current = new AbortController()
      controller.current.signal.onabort = onAbort
      const theController = controller.current

      setLoading(true)
      setError(undefined)

      let { route, options } = await makeRouteAndOptions(
        requestInit,
        method,
        theController,
        routeOrBody,
        body,
        interceptors.request,
      )

      const timer = timeout > 0 && setTimeout(() => {
        timedout.current = true;
        theController.abort()
        if (onTimeout) onTimeout()
      }, timeout)

      let theData
      let theRes

      try {
        theRes = ((await fetch(`${url}${path}${route}`, options)) || {}) as Res<TData>
        res.current = theRes.clone()

        try {
          theData = await theRes.json()
        } catch (err) {
          theData = (await theRes.text()) as any // FIXME: should not be `any` type
        }

        theData = (defaults.data && isEmpty(theData)) ? defaults.data : theData
        theRes.data = theData
        res.current.data = theData

        res.current = interceptors.response ? interceptors.response(res.current) : res.current
        invariant('data' in res.current, 'You must have `data` field on the Response returned from your `interceptors.response`')
        data.current = res.current.data as TData

      } catch (err) {
        if (attempts.current > 0) return doFetch(routeOrBody, body)
        if (attempts.current < 1 && timedout.current) setError({ name: 'AbortError', message: 'Timeout Error' })
        if (err.name !== 'AbortError') setError(err)

      } finally {
        if (attempts.current > 0) attempts.current -= 1
        timedout.current = false
        if (timer) clearTimeout(timer)
        controller.current = undefined
        setLoading(false)
      }
      return data.current
    }

    return doFetch

  }, [url, requestInit, isServer])

  const post = makeFetch(HTTPMethod.POST)
  const del = makeFetch(HTTPMethod.DELETE)

  const request: Req<TData> = {
    get: makeFetch(HTTPMethod.GET),
    post,
    patch: makeFetch(HTTPMethod.PATCH),
    put: makeFetch(HTTPMethod.PUT),
    del,
    delete: del,
    abort: () => controller.current && controller.current.abort(),
    query: (query, variables) => post({ query, variables }),
    mutate: (mutation, variables) => post({ mutation, variables }),
    loading: loading as boolean,
    error,
    data: data.current,
  }

  const executeRequest = useCallback(() => {
    const methodName = requestInit.method || HTTPMethod.GET
    const methodLower = methodName.toLowerCase() as keyof ReqMethods
    if (methodName !== HTTPMethod.GET) {
      const req = request[methodLower] as BodyOnly
      req(requestInit.body as BodyInit)
    } else {
      const req = request[methodLower] as NoArgs
      req()
    }
  }, [requestInit.body, requestInit.method])

  const mounted = useRef(false)

  // handling onUpdate
  useEffect((): void => {
    if (onUpdate.length === 0 || !mounted.current) return
    executeRequest()
  }, [...onUpdate, executeRequest])

  // handling onMount
  useEffect((): void => {
    if (mounted.current) return
    mounted.current = true
    if (!onMount) return
    executeRequest()
  }, [onMount, executeRequest])

  return Object.assign<UseFetchArrayReturn<TData>, UseFetchObjectReturn<TData>>(
    [request, makeResponseProxy(res), loading as boolean, error],
    { request, response: makeResponseProxy(res), ...request },
  )
}

export { useFetch }
export default useFetch
