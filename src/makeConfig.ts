import { useCallback } from "react"
import { Options, FetchContextTypes, OptionsMaybeURL, NoUrlOptions } from './types'
import { isString, isObject, invariant, pullOutRequestInit } from "./utils"

function makeConfig(context: FetchContextTypes, urlOrOptions?: string | OptionsMaybeURL, optionsNoURLs?: NoUrlOptions): Options {
  let onMount = false
  let url = context.url || ''
  let options: Partial<Options> = {}
  let requestInit: RequestInit = {};

  const handleUseFetchOptions = useCallback((useFetchOptions?: OptionsMaybeURL): void => {
    const opts = useFetchOptions || {} as Options
    if ('onMount' in opts) onMount = opts.onMount as boolean
    if ('url' in opts) url = opts.url as string
  }, [])

  // ex: useFetch('https://url.com', { onMount: true })
  if (isString(urlOrOptions) && isObject(optionsNoURLs)) {
    url = urlOrOptions as string
    requestInit = pullOutRequestInit(optionsNoURLs)
    handleUseFetchOptions(optionsNoURLs)

    // ex: useFetch('https://url.com')
  } else if (isString(urlOrOptions) && optionsNoURLs === undefined) {
    url = urlOrOptions as string

    // ex: useFetch({ onMount: true }) OR useFetch({ url: 'https://url.com' })
  } else if (isObject(urlOrOptions)) {
    invariant(!optionsNoURLs, 'You cannot have a 2nd parameter of useFetch when your first argument is a object config.')
    let optsWithURL = urlOrOptions as Options
    invariant(!!context.url || !!optsWithURL.url, 'You have to either set a URL in your options config or set a global URL in your <Provider url="https://url.com"></Provider>')
    requestInit = pullOutRequestInit(urlOrOptions)
    handleUseFetchOptions(urlOrOptions as OptionsMaybeURL)
  }

  options.url = url
  options.onMount = onMount

  return {
    url,
    onMount,
    ...options,
    ...requestInit
  } as Options;
}

export { makeConfig }
export default makeConfig