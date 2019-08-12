import useFetch from '.'
import {
  HTTPMethod,
  NoUrlOptions,
  UseFetchBaseResult,
  OptionsMaybeURL,
  FetchData,
} from './types'
import useCustomOptions from './useCustomOptions'
import useRequestInit from './useRequestInit'

type ArrayDestructure<TData = any> = [
  TData | undefined,
  boolean,
  Error,
  FetchData,
]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  patch: FetchData
}
type UsePatch<TData = any> = ArrayDestructure<TData> & ObjectDestructure<TData>

export const usePatch = <TData = any>(
  urlOrOptions?: string | OptionsMaybeURL,
  optionsNoURLs?: NoUrlOptions,
): UsePatch<TData> => {
  const customOptions = useCustomOptions(urlOrOptions, optionsNoURLs)
  const requestInit = useRequestInit(urlOrOptions, optionsNoURLs)

  const { data, loading, error, patch } = useFetch<TData>({
    ...customOptions,
    ...requestInit,
    method: HTTPMethod.PATCH,
  })
  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, patch],
    { data, loading, error, patch },
  )
}
