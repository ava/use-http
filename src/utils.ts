import { useMemo, useEffect, MutableRefObject, useRef, useCallback, DependencyList } from 'react'
import useSSR from 'use-ssr'
import { RequestInitJSON, Options, Res, HTTPMethod, ResponseType } from './types'
import { FunctionKeys, NonFunctionKeys } from 'utility-types'

/**
 * Used for error checking. If the condition is false, throw an error
 */
export function invariant(
  condition: boolean,
  format: string,
  a = '',
  b = '',
  c = '',
  d = '',
  e = '',
  f = ''
): void {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument')
    }
  }

  if (!condition) {
    let error
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
          'for the full error message and additional helpful warnings.'
      )
    } else {
      const args = [a, b, c, d, e, f]
      let argIndex = 0
      error = new Error(format.replace(/%s/g, (): string => args[argIndex++]))
      error.name = 'Invariant Violation'
    }

    throw error
  }
}

export const useExampleURL = (): string => {
  const { isBrowser } = useSSR()
  return useMemo(
    (): string =>
      isBrowser ? (window.location.origin as string) : 'https://example.com',
    [isBrowser]
  )
}

export function useURLRequiredInvariant(
  condition: boolean,
  method: string,
  optionalMessage?: string
): void {
  const exampleURL = useExampleURL()
  useEffect((): void => {
    invariant(
      condition,
      `${method} requires a URL to be set as the 1st argument,\n
      unless you wrap your app like:\n
      <Provider url="${exampleURL}"><App /></Provider>\n
      ${optionalMessage}`
    )
  }, [condition, exampleURL, method, optionalMessage])
}

export const isString = (x: any): x is string => typeof x === 'string' // eslint-disable-line

/**
 * Determines if the given param is an object. {}
 * @param obj
 */
export const isObject = (obj: any): obj is object => Object.prototype.toString.call(obj) === '[object Object]' // eslint-disable-line

/**
 * Determines if the given param is an object that can be used as a request body.
 * Returns true for native objects or arrays.
 * @param obj
 */
export const isBodyObject = (obj: any): boolean => isObject(obj) || Array.isArray(obj)

export const isFunction = (v: any): boolean => typeof v === 'function'

export const isNumber = (v: any): boolean => Object.prototype.toString.call(v) === '[object Number]'

// const requestFields = Object.getOwnPropertyNames(Object.getPrototypeOf(new Request('')))
// const responseFields = Object.getOwnPropertyNames(Object.getPrototypeOf(new Response()))
// export const customResponseFields = [...responseFields, 'data']

// TODO: come back and fix the "anys" in this http://bit.ly/2Lm3OLi
/**
 * Makes an object that will match the standards of a normal fetch's options
 * aka: pulls out all useFetch's special options like "onMount"
 */
export const pullOutRequestInit = (options?: Options): RequestInit => {
  if (!options) return {}
  const requestInitFields = [
    'body',
    'cache',
    'credentials',
    'headers',
    'integrity',
    'keepalive',
    'method',
    'mode',
    'redirect',
    'referrer',
    'referrerPolicy',
    'signal',
    'window'
  ] as (keyof RequestInitJSON)[]
  return requestInitFields.reduce(
    (acc: RequestInit, key: keyof RequestInit): RequestInit => {
      if (key in options) acc[key] = options[key]
      return acc
    },
    {}
  )
}

export const isEmpty = (x: any) => x === undefined || x === null

export enum Device {
  Browser = 'browser',
  Server = 'server',
  Native = 'native',
}

const { Browser, Server, Native } = Device

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

const canUseNative: boolean = typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

const device = canUseNative ? Native : canUseDOM ? Browser : Server

export const isBrowser = device === Browser
export const isServer = device === Server
export const isNative = device === Native

export const tryGetData = async (res: Response | undefined, defaultData: any, responseType: ResponseType) => {
  if (typeof res === 'undefined') throw Error('Response cannot be undefined... 😵')
  if (typeof responseType === 'undefined') throw Error('responseType cannot be undefined... 😵')
  const types = (Array.isArray(responseType) ? responseType : [responseType]) as ResponseType
  if (types[0] == null) throw Error('could not parse data from response 😵')
  const data = await tryRetry(res, types)
  return !isEmpty(defaultData) && isEmpty(data) ? defaultData : data
}

const tryRetry = async <T = any>(res: Response, types: ResponseType, i: number = 0): Promise<T> => {
  try {
    return await (res.clone() as any)[types[i]]()
  } catch (error) {
    if (types.length - 1 === i) throw error
    return tryRetry(res.clone(), types, ++i)
  }
}

/**
 * TODO: missing some fields that are in the mozilla docs: https://developer.mozilla.org/en-US/docs/Web/API/Response#Properties
 * 1. trailers (inconsistancy in the docs. Part says `trailers` another says `trailer`)
 * 2. useFinalURL
 */
type ResponseFields = (NonFunctionKeys<Res<any>> | 'data')
export const responseFields: ResponseFields[] = ['headers', 'ok', 'redirected', 'trailer', 'status', 'statusText', 'type', 'url', 'body', 'bodyUsed', 'data']
/**
 * TODO: missing some methods that are in the mozilla docs: https://developer.mozilla.org/en-US/docs/Web/API/Response#Methods
 * 1. error
 * 2. redirect
 */
type ResponseMethods = Exclude<FunctionKeys<Res<any>>, 'data'>
export const responseMethods: ResponseMethods[] = ['clone', 'arrayBuffer', 'blob', 'formData', 'json', 'text']
// const responseFields = [...Object.getOwnPropertyNames(Object.getPrototypeOf(new Response())), 'data'].filter(p => p !== 'constructor')
type ResponseKeys = (keyof Res<any>)
export const responseKeys: ResponseKeys[] = [...responseFields, ...responseMethods]
export const toResponseObject = <TData = any>(res?: Response | MutableRefObject<Response>, data?: any) => Object.defineProperties(
  {},
  responseKeys.reduce((acc: any, field: ResponseKeys) => {
    if (responseFields.includes(field as any)) {
      acc[field] = {
        get: () => {
          const response = res instanceof Response ? res : res && res.current
          if (!response) return
          if (field === 'data') return data.current
          const clonedResponse = ('clone' in response ? response.clone() : {}) as Res<TData>
          return clonedResponse[field as (NonFunctionKeys<Res<any>> | 'data')]
        },
        enumerable: true
      }
    } else if (responseMethods.includes(field as any)) {
      acc[field] = {
        value: () => {
          const response = res instanceof Response ? res : res && res.current
          if (!response) return
          const clonedResponse = ('clone' in response ? response.clone() : {}) as Res<TData>
          return clonedResponse[field as Exclude<FunctionKeys<Res<any>>, 'data'>]()
        },
        enumerable: true
      }
    }
    return acc
  }, {}))

export const emptyCustomResponse = toResponseObject()

// TODO: switch this to .reduce()
const headersAsObject = (headers: Headers): object => {
  const obj: any = {}
  headers.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}

export const serializeResponse = async (response: Response) => {
  const body = await response.text()
  const { status, statusText } = response
  const headers = headersAsObject(response.headers)
  return {
    body,
    status,
    statusText,
    headers
  }
}

function useDeepCompareMemoize(value: DependencyList) {
  const ref = useRef<DependencyList>()
  if (JSON.stringify(value) !== JSON.stringify(ref.current)) ref.current = value
  return ref.current as DependencyList
}

export const useDeepCallback = (cb: (method: HTTPMethod) => (...args: any) => any, deps: DependencyList) => useCallback(cb, useDeepCompareMemoize(deps))

export const sleep = (ms: number) => new Promise((resolve: any) => setTimeout(resolve, ms))

export const isPositiveNumber = (n: number) => Number.isInteger(n) && n > 0

export const makeError = (name: string | number, message: string) => {
  const error = new Error(message)
  error.name = name + ''
  return error
}

/**
 * Determines if we need to add a slash to front
 * of a path, and adds it if we do.
 * Cases:
 * (path = '', url = '' || null | undefined) => ''
 * (path = '?foo=bar', url = 'a.com')        => '?foo=bar'
 * (path = '?foo=bar', url = 'a.com/')       => '?foo=bar'
 * (path = 'bar', url = 'a.com/?foo=')       => 'bar'
 * (path = 'foo', url = 'a.com')             => '/foo'
 * (path = 'foo', url = 'a.com/')            => 'foo'
 * (path = '/foo', url = 'a.com')            => '/foo'
 * (path = '/foo', url = 'a.com/')           => 'foo'
 * (path = '?foo=bar')                       => '?foo=bar'
 * (path = 'foo')                            => '/foo'
 * (path = '/foo')                           => '/foo'
 * (path = '&foo=bar', url = 'a.com?b=k')    => '&foo=bar'
 * (path = '&foo=bar')                       => '&foo=bar'
 */
export const addSlash = (input?: string, url?: string) => {
  if (!input) return ''
  if (!url) {
    if (input.startsWith('?') || input.startsWith('&') || input.startsWith('/')) return input
    return `/${input}`
  }
  if (url.endsWith('/') && input.startsWith('/')) return input.substr(1)
  if (!url.endsWith('/') && !input.startsWith('/') && !input.startsWith('?') && !input.startsWith('&') && !url.includes('?') ) return `/${input}`
  return input
}
