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
  NoArgs,
} from './types'
import useFetchArgs from './useFetchArgs'
import doFetchArgs from './doFetchArgs'
import { invariant, tryGetData, toResponseObject, useDeepCallback, isFunction, isNumber, sleep } from './utils'
import useCache from './useCache'

const { CACHE_FIRST } = CachePolicies


function useFetch<TData = any>(...args: UseFetchArgs): UseFetch<TData> {
  const { customOptions, requestInit, defaults, dependencies } = useFetchArgs(...args)
  const {
    cacheLife,
    cachePolicy, // 'cache-first' by default
    interceptors,
    path,
    perPage,
    persist,
    onAbort,
    onNewData,
    onTimeout,
    retries,
    retryDelay,
    retryOn,
    suspense,
    timeout,
    url: initialURL,
  } = customOptions

  const cache = useCache({ persist, cacheLife, cachePolicy })

  const { isServer } = useSSR()

  const controller = useRef<AbortController>()
  const res = useRef<Res<TData>>({} as Res<TData>)
  const data = useRef<TData>(defaults.data)
  const timedout = useRef(false)
  const attempt = useRef(0)
  const error = useRef<any>()
  const hasMore = useRef(true)
  const suspenseStatus = useRef('pending')
  const suspender = useRef<Promise<any>>()
  const mounted = useRef(false)

  const [loading, setLoading] = useState<boolean>(defaults.loading)
  const forceUpdate = useReducer(() => ({}), [])[1]

  const makeFetch = useDeepCallback((method: HTTPMethod): FetchData => {
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
      
      if (!suspense && mounted.current) setLoading(true)
      error.current = undefined

      if (response.isCached && cachePolicy === CACHE_FIRST) {
        try {
          res.current = response.cached as Res<TData>
          res.current.data = await tryGetData(response.cached, defaults.data)
          data.current = res.current.data as TData
          if (!suspense && mounted.current) setLoading(false)
          return data.current
        } catch (err) {
          error.current = err
          if (mounted.current) setLoading(false)
        }
      }

      // don't perform the request if there is no more data to fetch (pagination)
      if (perPage > 0 && !hasMore.current && !error.current) return data.current

      const timer = timeout && setTimeout(() => {
        timedout.current = true
        theController.abort()
        if (onTimeout) onTimeout()
      }, timeout)

      let newData
      let newRes

      try {
        newRes = await fetch(url, options)
        res.current = newRes.clone()

        if (cachePolicy === CACHE_FIRST) {
          await cache.set(response.id, newRes.clone())
        }

        newData = await tryGetData(newRes, defaults.data)
        res.current.data = onNewData(data.current, newData)

        res.current = interceptors.response ? await interceptors.response(res.current) : res.current
        invariant('data' in res.current, 'You must have `data` field on the Response returned from your `interceptors.response`')
        data.current = res.current.data as TData

        if (Array.isArray(data.current) && !!(data.current.length % perPage)) hasMore.current = false
      } catch (err) {
        const opts = { attempt: attempt.current, error: err, response: null }
        const shouldRetry = (
          Array.isArray(retryOn) && retryOn.includes(res.current.status)
          || isFunction(retryOn) && (retryOn as Function)(opts)
          || retries > 0
        ) && retries > attempt.current
        const delay = (isFunction(retryDelay) ? (retryDelay as Function)(opts) : retryDelay) as number
        invariant(isNumber(delay), 'retryDelay must be a number! If you\'re using it as a function, it must return a number.')

        if (shouldRetry) {
          attempt.current++
          if (delay) await sleep(delay)
          return doFetch(routeOrBody, body)
        }
        if (attempt.current >= retries && timedout.current) error.current = { name: 'AbortError', message: 'Timeout Error' }
        if (err.name !== 'AbortError') error.current = err
      } finally {
        // if (attempt.current === retries) attempt.current = 0
        if (newRes && !newRes.ok && !error.current) error.current = { name: newRes.status, message: newRes.statusText }
        timedout.current = false
        if (timer) clearTimeout(timer)
        controller.current = undefined
      }

      if (!suspense && mounted.current) setLoading(false)

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
    loading,
    error: error.current,
    data: data.current,
    cache
  }

  const response = toResponseObject<TData>(res, data)

  // onMount/onUpdate
  useEffect((): any => {
    mounted.current = true
    if (Array.isArray(dependencies)) {
      const methodName = requestInit.method || HTTPMethod.GET
      const methodLower = methodName.toLowerCase() as keyof ReqMethods
      const req = request[methodLower] as NoArgs
      req()
    }
    return () => mounted.current = false
  }, dependencies)

  // Cancel any running request when unmounting to avoid updating state after component has unmounted
  // This can happen if a request's promise resolves after component unmounts
  useEffect(() => request.abort, [])

  if (suspense && suspender.current) {
    if (isServer) throw new Error('Suspense on server side is not yet supported! 🙅‍♂️')
    switch (suspenseStatus.current) {
      case 'pending':
        throw suspender.current
      case 'error':
        throw error.current
    }
  }
  return Object.assign<UseFetchArrayReturn<TData>, UseFetchObjectReturn<TData>>(
    [request, response, loading, error.current],
    { request, response, ...request }
  )
}

export { useFetch }
export default useFetch
