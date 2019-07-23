import { HTTPMethod } from './types'
import { isObject, invariant, isBrowser, isString } from './utils'
import { MutableRefObject } from 'react'

interface RouteAndOptions {
  route: string
  options: RequestInit
}

export default function makeRouteAndOptions(
  initialOptions: RequestInit,
  method: HTTPMethod,
  controller: MutableRefObject<AbortController | null | undefined>,
  routeOrBody?: string | BodyInit | object,
  bodyAs2ndParam?: BodyInit | object,
): RouteAndOptions {
  invariant(
    !(isObject(routeOrBody) && isObject(bodyAs2ndParam)),
    `If first argument of ${method.toLowerCase()}() is an object, you cannot have a 2nd argument. 😜`,
  )
  invariant(
    !(method === HTTPMethod.GET && isObject(routeOrBody)),
    `You can only have query params as 1st argument of request.get()`,
  )
  invariant(
    !(method === HTTPMethod.GET && bodyAs2ndParam !== undefined),
    `You can only have query params as 1st argument of request.get()`,
  )

  const route = ((): string => {
    if (isBrowser && routeOrBody instanceof URLSearchParams)
      return `?${routeOrBody}`
    if (isString(routeOrBody)) return routeOrBody as string
    return ''
  })()

  const body = ((): string => {
    if (isObject(routeOrBody)) return JSON.stringify(routeOrBody)
    if (isObject(bodyAs2ndParam)) return JSON.stringify(bodyAs2ndParam)
    if (
      isBrowser && (
        bodyAs2ndParam instanceof FormData ||
        bodyAs2ndParam instanceof URLSearchParams
      )) return bodyAs2ndParam;
    return JSON.stringify({})
  })()

  const options = ((): RequestInit => {
    const opts = {
      ...initialOptions,
      body,
      method,
      signal: controller.current ? controller.current.signal : null,
      headers: {
        // default content types http://bit.ly/2N2ovOZ
        // Accept: 'application/json',
        'Content-Type': 'application/json',
        ...initialOptions.headers,
      },
    }
    if (
      isBrowser &&
      (routeOrBody instanceof URLSearchParams ||
        routeOrBody instanceof FormData ||
        bodyAs2ndParam instanceof FormData)
    ) {
      delete opts.headers['Content-Type']
    }
    if (method === HTTPMethod.GET) delete opts.body
    return opts
  })()

  return {
    route,
    options,
  }
}
