import useFetch from '.'
import {
  HTTPMethod,
  NoUrlOptions,
  UseFetchBaseResult,
  OptionsMaybeURL,
} from './types'
import useCustomOptions from './useCustomOptions'
import useRequestInit from './useRequestInit'

type ArrayDestructure<TData = any> = [
  TData | undefined,
  boolean,
  Error,
  (route?: string) => Promise<any>,
]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  get: (route?: string) => Promise<any>
}
type UseGet = ArrayDestructure & ObjectDestructure

export const useGet = <TData = any>(
  urlOrOptions?: string | OptionsMaybeURL,
  optionsNoURLs?: NoUrlOptions,
): UseGet => {
  const customOptions = useCustomOptions(urlOrOptions, optionsNoURLs)
  const requestInit = useRequestInit(urlOrOptions, optionsNoURLs)

  const { data, loading, error, get } = useFetch<TData>({
    ...customOptions,
    ...requestInit,
    method: HTTPMethod.GET,
  })
  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, get],
    { data, loading, error, get },
  )
}
