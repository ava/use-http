import { OptionsMaybeURL, NoUrlOptions, RequestInitJSON } from './types'
import { isObject, pullOutRequestInit } from "./utils"
import { useContext } from 'react'
import FetchContext from './FetchContext'

export default function useRequestInit(urlOrOptions?: string | OptionsMaybeURL, optionsNoURLs?: NoUrlOptions): RequestInitJSON {
  const context = useContext(FetchContext)

  const requestInitOptions = isObject(urlOrOptions) ? urlOrOptions : isObject(optionsNoURLs) ? optionsNoURLs : {}
  let requestInit: RequestInit = pullOutRequestInit(requestInitOptions)

  return {
    ...context.options,
    ...requestInit,
    headers: {
      // default content types http://bit.ly/2N2ovOZ
      // Accept: 'application/json', 
      'Content-Type': 'application/json',
      ...(context.options || {}).headers,
      ...requestInit.headers,
    } as { 'Content-Type': string },
  }
}