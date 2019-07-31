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
  post: FetchData
}
type UsePost<TData = any> = ArrayDestructure<TData> & ObjectDestructure<TData>

export const usePost = <TData = any>(
  urlOrOptions?: string | OptionsMaybeURL,
  optionsNoURLs?: NoUrlOptions,
): UsePost<TData> => {
  const customOptions = useCustomOptions(urlOrOptions, optionsNoURLs)
  const requestInit = useRequestInit(urlOrOptions, optionsNoURLs)

  const { data, loading, error, post } = useFetch<TData>({
    ...customOptions,
    ...requestInit,
    method: HTTPMethod.POST,
  })

  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, post],
    { data, loading, error, post },
  )
}
