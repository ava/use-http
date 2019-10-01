import { OptionsMaybeURL, NoUrlOptions, FetchContextTypes } from './types'
import { isObject, pullOutRequestInit } from './utils'
import { useContext } from 'react'
import FetchContext from './FetchContext'

export default function useRequestInit(
  urlOrOptions?: string | OptionsMaybeURL,
  optionsNoURLs?: NoUrlOptions,
): RequestInit {
  const context: FetchContextTypes = useContext(FetchContext)
  const contextRequestInit = pullOutRequestInit(context.options as OptionsMaybeURL)

  const requestInitOptions = isObject(urlOrOptions)
    ? urlOrOptions
    : isObject(optionsNoURLs)
    ? optionsNoURLs
    : {}
  const requestInit: RequestInit = pullOutRequestInit(requestInitOptions)

  return {
    ...contextRequestInit,
    ...requestInit,
    headers: {
      // default content types http://bit.ly/2N2ovOZ
      // Accept: 'application/json',
      'Content-Type': 'application/json',
      ...contextRequestInit.headers,
      ...requestInit.headers,
    },
  }
}
