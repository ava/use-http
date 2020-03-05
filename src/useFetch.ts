import { useEffect, useState, useCallback, useRef } from 'react'
import useSSR from 'use-ssr'
import {
  HTTPMethod,
  UseFetch,
  ReqMethods,
  Req,
  Res,
  UseFetchArrayReturn,
  UseFetchObjectReturn,
  UseFetchArgs,
  CachePolicies,
  FetchData,
  NoArgs
} from './types'
import useFetchArgs from './useFetchArgs'
import doFetchArgs from './doFetchArgs'
import { invariant, tryGetData } from './utils'

const { CACHE_FIRST } = CachePolicies

const responseFields = [...Object.getOwnPropertyNames(Object.getPrototypeOf(new Response())), 'data']
const cache = new Map()

function useFetch<TData = any>(...args: UseFetchArgs): UseFetch<TData> {
  const { customOptions, requestInit, defaults, dependencies } = useFetchArgs(...args)
  const {
    url: initialURL,
    path,
    interceptors,
    timeout,
    retries,
    onTimeout,
    onAbort,
    onNewData,
    perPage,
    cachePolicy, // 'cache-first' by default
    cacheLife
  } = customOptions

  const { isServer } = useSSR()

  const controller = useRef<AbortController>()
  const res = useRef<Res<TData>>({} as Res<TData>)
  const data = useRef<TData>(defaults.data)
  const timedout = useRef(false)
  const attempts = useRef(retries)
  const error = useRef<any>()
  const hasMore = useRef(true)

  const [loading, setLoading] = useState<boolean>(defaults.loading)

  const makeFetch = useCallback((method: HTTPMethod): FetchData => {
    const doFetch = async (
      routeOrBody?: string | BodyInit | object,
      body?: BodyInit | object
    ): Promise<any> => {
      if (isServer) return // for now, we don't do anything on the server
      controller.current = new AbortController()
      controller.current.signal.onabort = onAbort
      const theController = controller.current

      const { url, options, response } = await doFetchArgs<TData>(
        requestInit,
        initialURL,
        path,
        method,
        theController,
        cachePolicy,
        cache,
        routeOrBody,
        body,
        interceptors.request
      )

      if (response.isCached && cachePolicy === CACHE_FIRST) {
        setLoading(true)
        if (cacheLife > 0 && response.age > cacheLife) {
          cache.delete(response.id)
          cache.delete(response.ageID)
        } else {
          try {
            res.current.data = await tryGetData(response.cached, defaults.data)
            data.current = res.current.data as TData
            setLoading(false)
            return data.current
          } catch (err) {
            error.current = err
            setLoading(false)
          }
        }
      }

      // don't perform the request if there is no more data to fetch (pagination)
      if (perPage > 0 && !hasMore.current && !error.current) return data.current

      setLoading(true)
      error.current = undefined

      const timer = timeout > 0 && setTimeout(() => {
        timedout.current = true
        theController.abort()
        if (onTimeout) onTimeout()
      }, timeout)

      let newData
      let newRes

      try {
        newRes = await fetch(url, options)// as Res<TData>
        res.current = newRes.clone()

        if (cachePolicy === CACHE_FIRST) {
          cache.set(response.id, newRes.clone())
          if (cacheLife > 0) cache.set(response.ageID, Date.now())
        }

        newData = await tryGetData(newRes, defaults.data)
        res.current.data = onNewData(data.current, newData)

        res.current = interceptors.response ? interceptors.response(res.current) : res.current
        invariant('data' in res.current, 'You must have `data` field on the Response returned from your `interceptors.response`')
        data.current = res.current.data as TData

        if (Array.isArray(data.current) && !!(data.current.length % perPage)) hasMore.current = false

      } catch (err) {
        if (attempts.current > 0) return doFetch(routeOrBody, body)
        if (attempts.current < 1 && timedout.current) error.current = { name: 'AbortError', message: 'Timeout Error' }
        if (err.name !== 'AbortError') error.current = err

      } finally {
        if (newRes && !newRes.ok && !error.current) error.current = { name: newRes.status, message: newRes.statusText }
        if (attempts.current > 0) attempts.current -= 1
        timedout.current = false
        if (timer) clearTimeout(timer)
        controller.current = undefined
      }

      setLoading(false)

      return data.current
    }

    return doFetch
  }, [isServer, onAbort, requestInit, initialURL, path, interceptors, cachePolicy, perPage, timeout, cacheLife, onTimeout, defaults.data, onNewData])

  const post = useCallback(makeFetch(HTTPMethod.POST), [makeFetch])
  const del = useCallback(makeFetch(HTTPMethod.DELETE), [makeFetch])

  const request: Req<TData> = {
    get: useCallback(makeFetch(HTTPMethod.GET), [makeFetch]),
    post,
    patch: useCallback(makeFetch(HTTPMethod.PATCH), [makeFetch]),
    put: useCallback(makeFetch(HTTPMethod.PUT), [makeFetch]),
    del,
    delete: del,
    abort: () => controller.current && controller.current.abort(),
    query: (query, variables) => post({ query, variables }),
    mutate: (mutation, variables) => post({ mutation, variables }),
    loading: loading,
    error: error.current,
    data: data.current
  }

  // onMount/onUpdate
  useEffect((): any => {
    if (dependencies && Array.isArray(dependencies)) {
      const methodName = requestInit.method || HTTPMethod.GET
      const methodLower = methodName.toLowerCase() as keyof ReqMethods
      const req = request[methodLower] as NoArgs
      req()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  // Cancel any running request when unmounting to avoid updating state after component has unmounted
  // This can happen if a request's promise resolves after component unmounts
  useEffect(() => request.abort, [request.abort])

  const response = Object.defineProperties({}, responseFields.reduce((acc: any, field) => {
    acc[field] = { get: () => res.current[field as keyof Res<TData>] }
    return acc
  }, {}))

  return Object.assign<UseFetchArrayReturn<TData>, UseFetchObjectReturn<TData>>(
    [request, response, loading, error.current],
    { request, response, ...request }
  )
}

export { useFetch }
export default useFetch
