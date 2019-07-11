/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, Options, UseFetchBaseResult } from './types'
import { useURLRequiredInvariant } from './utils'

type ArrayDestructure<TData = any> = [TData | undefined, boolean, Error, (variables?: object) => Promise<any>]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  put: (variables?: object) => Promise<any>
}
type UsePut = ArrayDestructure & ObjectDestructure

export const usePut = <TData = any>(url?: string, options?: Omit<Options, 'url'>): UsePut => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!url || !!context.url, 'usePut')

  const { data, loading, error, put } = useFetch<TData>(url, {
    method: HTTPMethod.PUT,
    ...options
  })
  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, put],
    { data, loading, error, put }
  )
}
