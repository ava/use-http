import { HTTPMethod, Interceptors, ValueOf, DoFetchArgs, Cache } from './types'
import { invariant, isServer, isString, isBodyObject, addSlash } from './utils'

const { GET } = HTTPMethod

export default async function doFetchArgs<TData = any>(
  initialOptions: RequestInit,
  method: HTTPMethod,
  controller: AbortController,
  cacheLife: number,
  cache: Cache,
  host?: string,
  path?: string,
  routeOrBody?: string | BodyInit | object,
  bodyAs2ndParam?: BodyInit | object,
  requestInterceptor?: ValueOf<Pick<Interceptors, 'request'>>
): Promise<DoFetchArgs> {
  invariant(
    !(isBodyObject(routeOrBody) && isBodyObject(bodyAs2ndParam)),
    `If first argument of ${method.toLowerCase()}() is an object, you cannot have a 2nd argument. 😜`
  )
  invariant(
    !(method === GET && isBodyObject(routeOrBody)),
    'You can only have query params as 1st argument of request.get()'
  )
  invariant(
    !(method === GET && bodyAs2ndParam !== undefined),
    'You can only have query params as 1st argument of request.get()'
  )

  const route = ((): string => {
    if (!isServer && routeOrBody instanceof URLSearchParams) return `?${routeOrBody}`
    if (isString(routeOrBody)) return routeOrBody as string
    return ''
  })()

  const url = `${host}${addSlash(path, host)}${addSlash(route)}`

  const body = ((): BodyInit | null => {
    // FormData instanceof check should go first, because React Native's FormData implementation
    // is indistinguishable from plain object when using isBodyObject check
    if (routeOrBody instanceof FormData) return routeOrBody
    if (isBodyObject(routeOrBody)) return JSON.stringify(routeOrBody)
    if (
      !isServer &&
      ((bodyAs2ndParam as any) instanceof FormData ||
        (bodyAs2ndParam as any) instanceof URLSearchParams)
    ) return bodyAs2ndParam as any
    if (isBodyObject(bodyAs2ndParam) || isString(bodyAs2ndParam)) return JSON.stringify(bodyAs2ndParam)
    if (isBodyObject(initialOptions.body) || isString(bodyAs2ndParam)) return JSON.stringify(initialOptions.body)
    return null
  })()

  const headers = ((): HeadersInit | null => {
    const contentType = ((initialOptions.headers || {}) as any)['Content-Type']
    const shouldAddContentType = !!contentType || [HTTPMethod.POST, HTTPMethod.PUT].includes(method) && !(body instanceof FormData)
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
    const opts: RequestInit = {
      ...initialOptions,
      method,
      signal: controller.signal
    }

    if (headers !== null) {
      opts.headers = headers
    } else {
      delete opts.headers
    }

    if (body !== null) opts.body = body

    if (requestInterceptor) {
      const interceptor = await requestInterceptor({ options: opts, url: host, path, route })
      return interceptor as any
    }
    return opts
  })()

  // TODO: if the body is a file, and this is a large file, it might exceed the size
  // limit of the key size. Potential solution: base64 the body
  // used to tell if a request has already been made
  const responseID = Object.entries({ url, method, body: options.body || '' })
    .map(([key, value]) => `${key}:${value}`).join('||')

  return {
    url,
    options,
    response: {
      isCached: await cache.has(responseID),
      id: responseID,
      cached: await cache.get(responseID) as Response | undefined
    }
  }
}
