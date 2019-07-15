import { useMemo, useEffect } from 'react'
import useSSR from 'use-ssr'

export function useURLRequiredInvariant(condition: boolean, method: string, optionalMessage?: string): void {
  const exampleURL = useExampleURL()
  useEffect(() => {
    invariant(
      condition,
      `${method} requires a URL to be set as the 1st argument,\n
      unless you wrap your app like:\n
      <Provider url="${exampleURL}"><App /></Provider>\n
      ${optionalMessage}`
    )
  }, [])
}

export const useExampleURL = (): string => {
  const { isBrowser } = useSSR()
  return useMemo(() => isBrowser ? window.location.origin : 'https://example.com', [isBrowser])
}

export const isString = (x: any): x is string => typeof x === 'string'

// TODO: come back and fix the "anys" in this http://bit.ly/2Lm3OLi
/**
 * Makes an object that will match the standards of a normal fetch's options
 * aka: pulls out all useFetch's special options like "onMount"
 */
export const pullOutRequestInit = (options?: {}): RequestInit => {
  let opts: any = {}
  if (options) opts = options
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
  ]
  return requestInitFields.reduce((acc: any, key) => {
    if (key in opts) acc[key] = opts[key]
    return acc
  }, {})
}

/**
 * Determines if the given param is an object. {}
 * @param obj
 */
export const isObject = (obj: any): obj is object => Object.prototype.toString.call(obj) === '[object Object]'

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
    var error
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      )
    } else {
      var args = [a, b, c, d, e, f]
      var argIndex = 0
      error = new Error(
        format.replace(/%s/g, () => args[argIndex++])
      )
      error.name = 'Invariant Violation'
    }

    throw error
  }
}