/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetch from '.'
import { HTTPMethod, NoUrlOptions, UseFetchBaseResult, OptionsMaybeURL } from './types'
import useCustomOptions from './useCustomOptions';
import useRequestInit from './useRequestInit';

type ArrayDestructure<TData = any> = [TData | undefined, boolean, Error, (variables?: BodyInit) => Promise<any>]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  delete: (variables?: BodyInit) => Promise<any>
  del: (variables?: BodyInit) => Promise<any>
}
type UseDelete = ArrayDestructure & ObjectDestructure

export const useDelete = <TData = any>(urlOrOptions?: string | OptionsMaybeURL, optionsNoURLs?: NoUrlOptions): UseDelete => {
  const customOptions = useCustomOptions(urlOrOptions, optionsNoURLs)
  const requestInit = useRequestInit(urlOrOptions, optionsNoURLs)

  const { data, loading, error, del } = useFetch<TData>({
    ...customOptions,
    ...requestInit,
    method: HTTPMethod.DELETE,
  })
  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, del],
    { data, loading, error, delete: del, del }
  )
}
