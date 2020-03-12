import { HTTPMethod, Interceptors, ValueOf, DoFetchArgs, CachePolicies, Res } from './types'
import { invariant, isServer, isString, isBodyObject } from './utils'
import persistentStorage from './persistentStorage'

const { GET } = HTTPMethod

export default async function doFetchArgs<TData = any>(
  initialOptions: RequestInit,
  initialURL: string,
  path: string,
  method: HTTPMethod,
  controller: AbortController,
  cachePolicy: CachePolicies,
  cacheLife: number,
  cache: Map<string, Res<TData> | number>,
  persist: boolean,
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

  const url = `${initialURL}${path}${route}`

  const body = ((): BodyInit | null => {
    if (isBodyObject(routeOrBody)) return JSON.stringify(routeOrBody)
    if (
      !isServer &&
      ((bodyAs2ndParam as any) instanceof FormData ||
        (bodyAs2ndParam as any) instanceof URLSearchParams)
    ) { return bodyAs2ndParam as string }
    if (isBodyObject(bodyAs2ndParam)) return JSON.stringify(bodyAs2ndParam)
    if (isBodyObject(initialOptions.body)) return JSON.stringify(initialOptions.body)
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
      signal: controller.signal
    }

    if (headers !== null) {
      opts.headers = headers
    } else {
      delete opts.headers
    }

    if (body !== null) opts.body = body

    if (requestInterceptor) {
      const interceptor = await requestInterceptor(opts, initialURL, path, route)
      return interceptor
    }
    return opts
  })()

  // TODO: see if `Object.entries` is supported for IE
  // TODO: if the body is a file, and this is a large file, it might exceed the size
  // limit of the key size in the Map
  // used to tell if a request has already been made
  const responseID = Object.entries({ url, method, body: options.body || '' })
    .map(([key, value]) => `${key}:${value}`).join('||')
  const responseAgeID = `${responseID}:ts`

  const responseAge = Date.now() - ((await cache.get(responseAgeID) || 0) as number)

  return {
    url,
    options,
    response: {
      isCached: await cache.has(responseID),
      isExpired: cacheLife > 0 && responseAge > cacheLife,
      id: responseID,
      cached: cache.get(responseID) as Response | undefined,
      ageID: responseAgeID,
    }
  }
}
