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
} from './types'
import { BodyOnly, FetchData, NoArgs } from './types'
import useFetchArgs from './useFetchArgs'
import doFetchArgs from './doFetchArgs'
import { isEmpty, invariant } from './utils'

const { CACHE_FIRST } = CachePolicies

const responseMethods = ['clone', 'error', 'redirect', 'arrayBuffer', 'blob', 'formData', 'json', 'text']

const makeResponseProxy = (res = {}) => new Proxy(res, {
  get: (httpResponse: any, key: string) => {
    if (responseMethods.includes(key)) return () => httpResponse.current[key]()
    return (httpResponse.current || {})[key]
  }
})

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
    cachePolicy, // 'cache-first' by default
    cacheLife,
  } = customOptions

  const { isServer } = useSSR()

  const controller = useRef<AbortController>()
  const res = useRef<Res<TData>>({} as Res<TData>)
  const data = useRef<TData>(defaults.data)
  const timedout = useRef(false)
  const attempts = useRef(retries)
  const error = useRef<any>()

  const [loading, setLoading] = useState<boolean>(defaults.loading)

  const makeFetch = useCallback((method: HTTPMethod): FetchData => {
    
    const doFetch = async (
      routeOrBody?: string | BodyInit | object,
      body?: BodyInit | object,
    ): Promise<any> => {
      if (isServer) return // for now, we don't do anything on the server
      controller.current = new AbortController()
      controller.current.signal.onabort = onAbort
      const theController = controller.current

      let { url, options, requestID } = await doFetchArgs(
        requestInit,
        initialURL,
        path,
        method,
        theController,
        routeOrBody,
        body,
        interceptors.request,
      )

      const isCached = cache.has(requestID)
      const cachedData = cache.get(requestID)
      if (isCached && cachePolicy === CACHE_FIRST) {
        const whenCached = cache.get(requestID + ':ts')
        let age = Date.now() - whenCached
        if (cacheLife > 0 && age > cacheLife) {
          cache.delete(requestID)
          cache.delete(requestID + ':ts')
        } else {
          return cachedData
        }
      }

      setLoading(true)
      error.current = undefined

      const timer = timeout > 0 && setTimeout(() => {
        timedout.current = true;
        theController.abort()
        if (onTimeout) onTimeout()
      }, timeout)

      let newData
      let theRes

      try {
        theRes = ((await fetch(url, options)) || {}) as Res<TData>
        res.current = theRes.clone()

        try {
          newData = await theRes.json()
        } catch (er) {
          try {
            newData = (await theRes.text()) as any // FIXME: should not be `any` type
          } catch (er) {}
        }

        newData = (defaults.data && isEmpty(newData)) ? defaults.data : newData
        res.current.data = onNewData(data.current, newData)

        res.current = interceptors.response ? interceptors.response(res.current) : res.current
        invariant('data' in res.current, 'You must have `data` field on the Response returned from your `interceptors.response`')
        data.current = res.current.data as TData

        if (cachePolicy === CACHE_FIRST) {
          cache.set(requestID, data.current)
          if (cacheLife > 0) cache.set(requestID + ':ts', Date.now())
        }

      } catch (err) {
        if (attempts.current > 0) return doFetch(routeOrBody, body)
        if (attempts.current < 1 && timedout.current) error.current = { name: 'AbortError', message: 'Timeout Error' }
        if (err.name !== 'AbortError') error.current = err

      } finally {
        if (theRes && !theRes.ok && !error.current) error.current = { name: theRes.status, message: theRes.statusText }
        if (attempts.current > 0) attempts.current -= 1
        timedout.current = false
        if (timer) clearTimeout(timer)
        controller.current = undefined
        setLoading(false)
      }
      return data.current
    }

    return doFetch

  }, [initialURL, requestInit, isServer])

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
    data: data.current,
  }

  // onMount/onUpdate
  useEffect((): any => {
    if (dependencies && Array.isArray(dependencies)) {
      const methodName = requestInit.method || HTTPMethod.GET
      const methodLower = methodName.toLowerCase() as keyof ReqMethods
      if (methodName !== HTTPMethod.GET) {
        const req = request[methodLower] as BodyOnly
        req(requestInit.body as BodyInit)
      } else {
        const req = request[methodLower] as NoArgs
        req()
      }
    }
  }, dependencies)

  // Cancel any running request when unmounting to avoid updating state after component has unmounted
  // This can happen if a request's promise resolves after component unmounts
  useEffect(() => request.abort, [])

  return Object.assign<UseFetchArrayReturn<TData>, UseFetchObjectReturn<TData>>(
    [request, makeResponseProxy(res), loading, error.current],
    { request, response: makeResponseProxy(res), ...request },
  )
}

export { useFetch }
export default useFetch
