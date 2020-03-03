import { useMemo, useEffect } from 'react'
import useSSR from 'use-ssr'
import { RequestInitJSON, OptionsMaybeURL } from './types'


/**
 * Used for error checking. If the condition is false, throw an error
 */
export function invariant(
  condition: boolean,
  format: string,
  a: string = '',
  b: string = '',
  c: string = '',
  d: string = '',
  e: string = '',
  f: string = '',
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
          'for the full error message and additional helpful warnings.',
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
    [isBrowser],
  )
}

export function useURLRequiredInvariant(
  condition: boolean,
  method: string,
  optionalMessage?: string,
): void {
  const exampleURL = useExampleURL()
  useEffect((): void => {
    invariant(
      condition,
      `${method} requires a URL to be set as the 1st argument,\n
      unless you wrap your app like:\n
      <Provider url="${exampleURL}"><App /></Provider>\n
      ${optionalMessage}`,
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

// const requestFields = Object.getOwnPropertyNames(Object.getPrototypeOf(new Request('')))
// const responseFields = Object.getOwnPropertyNames(Object.getPrototypeOf(new Response()))
// export const customResponseFields = [...responseFields, 'data']

// TODO: come back and fix the "anys" in this http://bit.ly/2Lm3OLi
/**
 * Makes an object that will match the standards of a normal fetch's options
 * aka: pulls out all useFetch's special options like "onMount"
 */
export const pullOutRequestInit = (options?: OptionsMaybeURL): RequestInit => {
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
    'window',
  ] as (keyof RequestInitJSON)[]
  return requestInitFields.reduce(
    (acc: RequestInit, key: keyof RequestInit): RequestInit => {
      if (key in options) acc[key] = options[key]
      return acc
    },
    {},
  )
}

export const isEmpty = (x: any) => x === undefined || x === null

export enum Device {
  Browser = 'browser',
  Server = 'server',
  Native = 'native',
}

const { Browser, Server, Native } = Device

const canUseDOM: boolean = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

const canUseNative: boolean = typeof navigator != 'undefined' && navigator.product == 'ReactNative'

const device = canUseNative ? Native : canUseDOM ? Browser : Server

export const isBrowser = device === Browser
export const isServer = device === Server
export const isNative = device === Native

export const tryGetData = async (res: Response | undefined, defaultData: any) => {
  if (typeof res === 'undefined') return
  // if (!isEmpty(res) && res.constructor.name !== 'Response') return undefined
  let data
  try {
    data = await res.json()
  } catch (er) {
    try {
      data = (await res.text()) as any // FIXME: should not be `any` type
    } catch (er) {}
  }

  return (defaultData && isEmpty(data)) ? defaultData : data
}
