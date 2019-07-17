/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetch from '.'
import { HTTPMethod, NoUrlOptions, UseFetchBaseResult, OptionsMaybeURL } from './types'
import useCustomOptions from './useCustomOptions';
import useRequestInit from './useRequestInit';

type ArrayDestructure<TData = any> = [TData | undefined, boolean, Error, (variables?: BodyInit) => Promise<any>]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  patch: (variables?: BodyInit) => Promise<any>
}
type UsePatch = ArrayDestructure & ObjectDestructure

export const usePatch = <TData = any>(urlOrOptions?: string | OptionsMaybeURL, optionsNoURLs?: NoUrlOptions): UsePatch => {
  const customOptions = useCustomOptions(urlOrOptions, optionsNoURLs)
  const requestInit = useRequestInit(urlOrOptions, optionsNoURLs)

  const { data, loading, error, patch } = useFetch<TData>({
    ...customOptions,
    ...requestInit,
    method: HTTPMethod.PATCH,
  })
  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, patch],
    { data, loading, error, patch }
  )
}
