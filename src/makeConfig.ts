import { Options, FetchContextTypes, OptionsMaybeURL, NoUrlOptions } from './types'
import { isString, isObject, pullOutRequestInit, invariant } from "./utils"

export const DefaultOptions: NoUrlOptions = {
  onMount: false
}

function makeConfig(context: FetchContextTypes, urlOrOptions?: string | OptionsMaybeURL, optionsNoURLs?: NoUrlOptions): Options {
  let options: Partial<Options> = {}
  let requestInit: RequestInit = {}

  invariant(!(isObject(urlOrOptions) && isObject(optionsNoURLs)), 'You cannot have a 2nd parameter of useFetch when your first argument is an object config.')

  const getUrl = (): string => {
    if (isString(urlOrOptions)) {
      return urlOrOptions
    }

    if (isObject(urlOrOptions) && !!urlOrOptions.url) {
      return urlOrOptions.url;
    }

    if (isObject(urlOrOptions) && !!urlOrOptions.url) {
      return urlOrOptions.url;
    }

    if (!!context.url) {
      return context.url;
    }

    // we need to throw rather than using invariant so getUrl does not return a value and casts to never
    throw new Error('You have to either set a URL in your options config or set a global URL in your <Provider url="https://url.com"></Provider>')
  }

  const getOnMount = (): boolean => {
    if (isObject(urlOrOptions)) {
      return !!urlOrOptions.onMount
    }

    if (isObject(optionsNoURLs)) {
      return !!optionsNoURLs.onMount
    }

    return false;
  }

  const requestInitOptions = isObject(urlOrOptions) ? urlOrOptions : isObject(optionsNoURLs) ? optionsNoURLs : {}
  requestInit = pullOutRequestInit(requestInitOptions)

  return {
    url: getUrl(),
    onMount: getOnMount(),
    headers: {
      // default content types http://bit.ly/2N2ovOZ
      // Accept: 'application/json', 
      'Content-Type': 'application/json',
      ...(context.options || {}).headers,
      ...options.headers
    },
    ...options,
    ...requestInit,
  } as Options
}

export { makeConfig }
export default makeConfig