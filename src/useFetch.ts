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
import { isEmpty } from './utils'

const log = (varName: string, actual: any, expected: any) => console.log(`${varName.toUpperCase()} === ${expected}: `, actual === expected ? '👍' : '👎')

function useFetch<TData = any>(...args: UseFetchArgs): UseFetch<TData> {
  const { customOptions, requestInit, defaults } = useFetchArgs(...args)
  const {
    url,
    onMount,
    onUpdate,
    path,
    interceptors,
    timeout,
    // retries
  } = customOptions
  log('timeout', 10, timeout)


  const { isServer } = useSSR()

  const controller = useRef<AbortController>()
  const res = useRef<Response>()
  const data = useRef<TData>(defaults.data)

  const [loading, setLoading] = useState(defaults.loading)
  const [error, setError] = useState<any>()

  const makeFetch = useCallback((method: HTTPMethod): FetchData => {
    
    const doFetch = async (
      routeOrBody?: string | BodyInit | object,
      body?: BodyInit | object,
    ): Promise<any> => {
      if (isServer) return // for now, we don't do anything on the server
      controller.current = new AbortController()

      setLoading(true)
      setError(undefined)

      let { route, options } = await makeRouteAndOptions(
        requestInit,
        method,
        controller,
        routeOrBody,
        body,
        interceptors.request,
      )

      let theData
      let timer

      try {
        if (timeout) {
          timer = setTimeout(() => {
            console.log('TIMED OUT');
            (controller.current as AbortController).abort()
            throw new Error('timed out 😘')
          }, timeout)
        }

        console.time('RES TIME')
        res.current = await fetch(`${url}${path}${route}`, options)
        console.timeEnd('RES TIME')
        console.log('RES: ', res.current)

        try {
          theData = await res.current.json()
        } catch (err) {
          theData = (await res.current.text()) as any // FIXME: should not be `any` type
        }
      } catch (err) {
        console.log('CATCH')
        console.log('SHOULD HAVE THROWN ERROR FOR TIMEOUT: ', err)
        if (err.name !== 'AbortError') setError(err)
      } finally {
        console.log('FINALLY')
        if (timer) clearTimeout(timer)
        data.current = (defaults.data && isEmpty(theData)) ? defaults.data : theData
        controller.current = undefined
        setLoading(false)
      }
      console.log('ERROR: ', error);
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

  const responseObj = { data: data.current, ...res.current }
  const response = interceptors.response ? interceptors.response(responseObj as Res<TData>) : responseObj

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
    [request, response as Res<TData>, loading as boolean, error],
    { request, response: response as Res<TData>, ...request },
  )
}

export { useFetch }
export default useFetch
