import { useMemo, useEffect } from 'react'
import useSSR from 'use-ssr'

export function useURLRequiredInvariant(condition: boolean, method: string): void {
  const exampleURL = useExampleURL()
  useEffect(() => {
    invariant(
      condition,
      `${method} requires a URL to be set as the 1st argument,\n
      unless you wrap your app like:\n
      <Provider url="${exampleURL}"><App /></Provider>`
    )
  }, [])
}


export const useExampleURL = (): string => {
  const { isBrowser } = useSSR()
  return useMemo(() => isBrowser ? window.location.origin : 'https://example.com', [isBrowser])
}


/**
 * Determines if the given param is an object. {}
 * @param obj
 */
export const isObject = (obj: any) => Object.prototype.toString.call(obj) === '[object Object]'

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