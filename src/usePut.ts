/* eslint-disable @typescript-eslint/no-explicit-any */
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
  (variables?: BodyInit) => Promise<any>,
]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  put: (variables?: BodyInit) => Promise<any>
}
type UsePut = ArrayDestructure & ObjectDestructure

export const usePut = <TData = any>(
  urlOrOptions?: string | OptionsMaybeURL,
  optionsNoURLs?: NoUrlOptions,
): UsePut => {
  const customOptions = useCustomOptions(urlOrOptions, optionsNoURLs)
  const requestInit = useRequestInit(urlOrOptions, optionsNoURLs)

  const { data, loading, error, put } = useFetch<TData>({
    ...customOptions,
    ...requestInit,
    method: HTTPMethod.PUT,
  })
  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, put],
    { data, loading, error, put },
  )
}
