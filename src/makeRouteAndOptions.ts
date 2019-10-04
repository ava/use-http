import { HTTPMethod, Interceptors, ValueOf } from './types'
import { isObject, invariant, isBrowser, isString } from './utils'
// import { MutableRefObject } from 'react'

const { GET, OPTIONS } = HTTPMethod

interface RouteAndOptions {
  route: string
  options: RequestInit
}

export default async function makeRouteAndOptions(
  initialOptions: RequestInit,
  method: HTTPMethod,
  controller: AbortController,
  routeOrBody?: string | BodyInit | object,
  bodyAs2ndParam?: BodyInit | object,
  requestInterceptor?: ValueOf<Pick<Interceptors, 'request'>>
): Promise<RouteAndOptions> {
  invariant(
    !(isObject(routeOrBody) && isObject(bodyAs2ndParam)),
    `If first argument of ${method.toLowerCase()}() is an object, you cannot have a 2nd argument. 😜`,
  )
  invariant(
    !(method === GET && isObject(routeOrBody)),
    `You can only have query params as 1st argument of request.get()`,
  )
  invariant(
    !(method === GET && bodyAs2ndParam !== undefined),
    `You can only have query params as 1st argument of request.get()`,
  )

  const route = ((): string => {
    if (isBrowser && routeOrBody instanceof URLSearchParams) return `?${routeOrBody}`
    if (isString(routeOrBody)) return routeOrBody as string
    return ''
  })()

  const body = ((): BodyInit => {
    if (isObject(routeOrBody)) return JSON.stringify(routeOrBody)
    if (isObject(bodyAs2ndParam)) return JSON.stringify(bodyAs2ndParam)
    if (
      isBrowser &&
      ((bodyAs2ndParam as any) instanceof FormData ||
        (bodyAs2ndParam as any) instanceof URLSearchParams)
    )
      return bodyAs2ndParam as string
    return JSON.stringify({})
  })()

  const options = await (async (): Promise<RequestInit> => {
    const opts = {
      ...initialOptions,
      body,
      method,
      signal: controller.signal,
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
    if (method === GET || method === OPTIONS) delete opts.body
    if (requestInterceptor) return await requestInterceptor(opts)
    return opts
  })()

  return {
    route,
    options,
  }
}
