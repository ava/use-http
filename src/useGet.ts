/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, Options, UseFetchBaseResult } from './types'
import { useURLRequiredInvariant } from './utils'

type ArrayDestructure<TData = any> = [TData | undefined, boolean, Error, (route?: string) => Promise<any>]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  get: (route?: string) => Promise<any>
}
type UseGet = ArrayDestructure & ObjectDestructure

export const useGet = <TData = any>(url?: string, options?: Omit<Options, 'url'>): UseGet => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!url || !!context.url, 'useGet')

  const { data, loading, error, get } = useFetch<TData>(url, {
    method: HTTPMethod.GET,
    ...options
  })
  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, get],
    { data, loading, error, get }
  )
}
