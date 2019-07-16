import { OptionsMaybeURL, NoUrlOptions, CustomOptions } from './types'
import { isString, isObject, invariant } from "./utils"
import { useContext, useMemo } from 'react';
import FetchContext from './FetchContext';

// Provider ex: useFetch({ url: 'https://url.com' }) -- (overwrites global url)
// TODO - Provider: arg1 = oldGlobalOptions => ({ my: 'new local options'}) (overwrite all global options for this instance of useFetch)

/**
 * Handles all special options.
 * Ex: (+ means not implemented)
 * - url
 * - onMount
 * + timeout
 * + retry - amount of times it will retry
 * + retryDuration - interval at which each retry is done
 */
export default function useCustomOptions(urlOrOptions?: string | OptionsMaybeURL, optionsNoURLs?: NoUrlOptions): CustomOptions {
  const context = useContext(FetchContext)
  invariant(!(isObject(urlOrOptions) && isObject(optionsNoURLs)), 'You cannot have a 2nd parameter of useFetch when your first argument is an object config.')

  const url = useMemo((): string => {
    if (isString(urlOrOptions) && urlOrOptions) return urlOrOptions as string
    if (isObject(urlOrOptions) && !!urlOrOptions.url) return urlOrOptions.url
    if (context.url) return context.url
    return ''
  }, [context.url, urlOrOptions])

  invariant(!!url, 'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')

  const onMount = useMemo((): boolean => {
    if (isObject(urlOrOptions)) return !!urlOrOptions.onMount
    if (isObject(optionsNoURLs)) return !!optionsNoURLs.onMount
    return false;
  }, [urlOrOptions, optionsNoURLs])

  return { url, onMount }
}
