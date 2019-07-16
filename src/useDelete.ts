/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, NoUrlOptions, UseFetchBaseResult } from './types'
import { useURLRequiredInvariant } from './utils'

type ArrayDestructure<TData = any> = [TData | undefined, boolean, Error, (variables?: BodyInit) => Promise<any>]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  delete: (variables?: BodyInit) => Promise<any>
  del: (variables?: BodyInit) => Promise<any>
}
type UseDelete = ArrayDestructure & ObjectDestructure

export const useDelete = <TData = any>(url?: string, options?: NoUrlOptions): UseDelete => {
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
