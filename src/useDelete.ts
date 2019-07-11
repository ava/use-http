/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, Options, UseFetchBaseResult } from './types'
import { useURLRequiredInvariant } from './utils'

type ArrayDestructure<TData = any> = [TData | undefined, boolean, Error, (variables?: object) => Promise<any>]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  delete: (variables?: object) => Promise<any>
  del: (variables?: object) => Promise<any>
}
type UseDelete = ArrayDestructure & ObjectDestructure

export const useDelete = <TData = any>(url?: string, options?: Omit<Options, 'url'>): UseDelete => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!url || !!context.url, 'useDelete')

  const { data, loading, error, del } = useFetch<TData>(url, {
    method: HTTPMethod.DELETE,
    ...options
  })
  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, del],
    { data, loading, error, delete: del, del }
  )
}
