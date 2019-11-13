import { HTTPMethod, Interceptors, ValueOf, RouteAndOptions } from './types'
import { isObject, invariant, isBrowser, isString } from './utils'

const { GET } = HTTPMethod

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

  const body = ((): BodyInit | null => {
    if (isObject(routeOrBody)) return JSON.stringify(routeOrBody)
    if (isObject(bodyAs2ndParam)) return JSON.stringify(bodyAs2ndParam)
    if (
      isBrowser &&
      ((bodyAs2ndParam as any) instanceof FormData ||
        (bodyAs2ndParam as any) instanceof URLSearchParams)
    )
      return bodyAs2ndParam as string
    if (isObject(initialOptions.body)) return JSON.stringify(initialOptions.body)
    return null
  })()

  const headers = ((): HeadersInit | null => {
    const contentType = ((initialOptions.headers || {}) as any)['Content-Type']
    const shouldAddContentType = !!contentType || [HTTPMethod.POST, HTTPMethod.PUT].includes(method)
    const headers: any = { ...initialOptions.headers }
    if (shouldAddContentType) {
      // default content types http://bit.ly/2N2ovOZ
      // Accept: 'application/json',
      // roughly, should only add for POST and PUT http://bit.ly/2NJNt3N
      // unless specified by the user
      headers['Content-Type'] = contentType || 'application/json'
    } else if (Object.keys(headers).length === 0) {
      return null
    }
    return headers
  })()

  const options = await (async (): Promise<RequestInit> => {
    const opts = {
      ...initialOptions,
      method,
      signal: controller.signal,
    }

    if (headers !== null) {
      opts.headers = headers
    } else {
      delete opts.headers
    }

    if (body !== null) opts.body = body

    if (requestInterceptor) return await requestInterceptor(opts)
    return opts
  })()

  return {
    route,
    options,
  }
}
