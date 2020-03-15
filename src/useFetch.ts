import { useEffect, useState, useCallback, useRef, useReducer } from 'react'
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
import { invariant, tryGetData, toResponseObject } from './utils'
import useCache from './useCache'

const { CACHE_FIRST } = CachePolicies

function useFetch<TData = any>(...args: UseFetchArgs): UseFetch<TData> {
  const { customOptions, requestInit, defaults, dependencies } = useFetchArgs(...args)
  const {
    url: initialURL,
    path,
    interceptors,
    persist,
    timeout,
    retries,
    onTimeout,
    onAbort,
    onNewData,
    perPage,
    cachePolicy, // 'cache-first' by default
    cacheLife,
    suspense
  } = customOptions

  const cache = useCache({ persist, cacheLife })

  const { isServer } = useSSR()

  const controller = useRef<AbortController>()
  const res = useRef<Res<TData>>({} as Res<TData>)
  const data = useRef<TData>(defaults.data)
  const timedout = useRef(false)
  const attempts = useRef(retries)
  const error = useRef<any>()
  const hasMore = useRef(true)
  const suspenseStatus = useRef('pending')
  const suspender = useRef<Promise<any>>()

  const [loading, setLoading] = useState<boolean>(defaults.loading)
  const forceUpdate = useReducer(() => ({}), [])[1]

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
        cacheLife,
        cache,
        routeOrBody,
        body,
        interceptors.request
      )
      
      if (!suspense) setLoading(true)
      error.current = undefined

      if (response.isCached && (persist || cachePolicy === CACHE_FIRST)) {
        try {
          res.current.data = await tryGetData(response.cached, defaults.data)
          data.current = res.current.data as TData
          if (!suspense) setLoading(false)
          return data.current
        } catch (err) {
          error.current = err
          setLoading(false)
        }
      }

      // don't perform the request if there is no more data to fetch (pagination)
      if (perPage > 0 && !hasMore.current && !error.current) return data.current

      const timer = timeout > 0 && setTimeout(() => {
        timedout.current = true
        theController.abort()
        if (onTimeout) onTimeout()
      }, timeout)

      let newData
      let newRes

      try {
        newRes = await fetch(url, options)
        res.current = newRes.clone()

        if (persist || cachePolicy === CACHE_FIRST) {
          await cache.set(response.id, newRes.clone())
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

      if (!suspense) setLoading(false)

      return data.current
    } // end of doFetch()

    if (suspense) {
      return async (...args) => {
        suspender.current = doFetch(...args).then(
          (newData) => {
            suspenseStatus.current = 'success'
            return newData
          },
          () => {
            suspenseStatus.current = 'error'
          }
        )
        forceUpdate()
        const newData = await suspender.current
        return newData
      }
    }

    return doFetch
  }, [isServer, onAbort, requestInit, initialURL, path, interceptors, cachePolicy, perPage, timeout, persist, cacheLife, onTimeout, defaults.data, onNewData, forceUpdate, suspense])

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

  const response = toResponseObject<TData>(res, data)

  // onMount/onUpdate
  useEffect((): any => {
    if (Array.isArray(dependencies)) {
      const methodName = requestInit.method || HTTPMethod.GET
      const methodLower = methodName.toLowerCase() as keyof ReqMethods
      const req = request[methodLower] as NoArgs
      req()
    }
  // TODO: need [request] in dependency array. Causing infinite loop though.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  // Cancel any running request when unmounting to avoid updating state after component has unmounted
  // This can happen if a request's promise resolves after component unmounts
  // TODO: should have [request.abort] in dependency array. Causing every request to be aborted though...
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => request.abort, [])

  const final = Object.assign<UseFetchArrayReturn<TData>, UseFetchObjectReturn<TData>>(
    [request, response, loading, error.current],
    { request, response, ...request }
  )

  if (suspense && suspender.current) {
    if (isServer) throw new Error('Suspense on server side is not yet supported! 🙅‍♂️')
    switch (suspenseStatus.current) {
      case 'pending':
        throw suspender.current
      case 'error':
        throw error.current
    }
  }
  return final
}

export { useFetch }
export default useFetch
