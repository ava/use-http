import { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react'
import FetchContext from './FetchContext'
import { HTTPMethod, Options, UseFetch, FetchCommands, DestructuringCommands, UseFetchResult, useFetchArg1 } from "./types"
import { invariant, isObject } from './utils'


export function useFetch<TData = any>(arg1?: useFetchArg1, arg2?: Options | RequestInit): UseFetch<TData> {
  const context = useContext(FetchContext)

  invariant(!!arg1 || !!context.url, 'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')

  let url: string | null = context.url || null
  let options = {} as { signal?: AbortSignal | null } & RequestInit
  let onMount = false
  let baseUrl = ''
  let method: string = HTTPMethod.GET

  const handleOptions = useCallback((opts: Options & RequestInit) => {
    if (true) {
      // take out all the things that are not normal `fetch` options
      // need to take this out of scope so can set the variables below correctly
      let { url, onMount, timeout, baseUrl, ...rest } = opts
      options = { signal: undefined, ...rest }
    }
    if (context.url) url = context.url
    if (opts.url) url = opts.url || context.url || ''
    if (opts.onMount) onMount = opts.onMount
    if (opts.method) method = opts.method
    if (opts.baseUrl) baseUrl = opts.baseUrl
  }, [])

  if (typeof arg1 === 'string') {
    // if we have a default url from context, and
    // arg1 is a string, and we're not using graphql
    // we treat arg1 as a relative route
    url = context.url && !context.graphql ? context.url + arg1 : arg1

    if (arg2 && isObject(arg2)) handleOptions(arg2)

  } else if (isObject(arg1)) {
    handleOptions(arg1 || {})
  }

  const [data, setData] = useState<TData>()
  const [loading, setLoading] = useState(onMount)
  const [error, setError] = useState<any>()
  const controller = useRef<AbortController | null>()

  const fetchData = useCallback(
    (method: string) => async (fetchArg1?: object | string, fetchArg2?: object | string) => {
      if ('AbortController' in window) {
        controller.current = new AbortController()
        options.signal = controller.current.signal
      }

      let query = ''
      // post | patch | put | etc.
      if (isObject(fetchArg1) && method.toLowerCase() !== 'get') {
        options.body = JSON.stringify(fetchArg1)

      // relative routes
      } else if (baseUrl && typeof fetchArg1 === 'string') {
        url = baseUrl + fetchArg1
        if (isObject(fetchArg2)) options.body = JSON.stringify(fetchArg2)
      }
      if (typeof fetchArg1 === 'string' && typeof fetchArg2 === 'string') query = fetchArg2

      try {
        setLoading(true)
        const response = await fetch(url + query, {
          method,
          ...context.options,
          ...options,
          headers: {
            // default content types http://bit.ly/2N2ovOZ
            Accept: 'application/json', 
            'Content-Type': 'application/json',
            ...(context.options || {}).headers,
            ...options.headers
          }
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
    },
    [url]
  )

  const get = useCallback(fetchData(HTTPMethod.GET), [])
  const post = useCallback(fetchData(HTTPMethod.POST), [])
  const patch = useCallback(fetchData(HTTPMethod.PATCH), [])
  const put = useCallback(fetchData(HTTPMethod.PUT), [])
  const del = useCallback(fetchData(HTTPMethod.DELETE), [])
  const query = useCallback((query?: string, variables?: object) => post({ query, variables }), [])
  const mutate = useCallback((mutation?: string, variables?: object) => post({ mutation, variables }), [])

  const abort = useCallback(() => {
    controller.current && controller.current.abort()
  }, [])

  const request: FetchCommands = useMemo(() => ({ get, post, patch, put, del, delete: del, abort, query, mutate }), [])

  useEffect(() => {
    const methodName = method.toLowerCase() as keyof typeof request
    if (onMount) request[methodName]()
  }, [])

  return Object.assign<DestructuringCommands<TData>, UseFetchResult<TData>>(
    [data, loading, error, request],
    { data, loading, error, request, ...request }
  )
}

export default useFetch
