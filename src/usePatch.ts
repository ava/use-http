/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, NoUrlOptions, UseFetchBaseResult } from './types'
import { useURLRequiredInvariant } from './utils'

type ArrayDestructure<TData = any> = [
  TData | undefined,
  boolean,
  Error,
  (variables?: BodyInit) => Promise<any>,
]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  patch: (variables?: BodyInit) => Promise<any>
}
type UsePatch = ArrayDestructure & ObjectDestructure

export const usePatch = <TData = any>(
  url?: string,
  options?: NoUrlOptions,
): UsePatch => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!url || !!context.url, 'usePatch')

  const { data, loading, error, patch } = useFetch<TData>(url, {
    method: HTTPMethod.PATCH,
    ...options,
  })
  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, patch],
    { data, loading, error, patch },
  )
}
