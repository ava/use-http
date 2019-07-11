/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, Options, UseFetchBaseResult } from './types'
import { useURLRequiredInvariant } from './utils'

type ArrayDestructure<TData = any> = [TData | undefined, boolean, Error, (variables?: object) => Promise<any>]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  post: (variables?: object) => Promise<any>
}
type UsePost = ArrayDestructure & ObjectDestructure

export const usePost = <TData = any>(url?: string, options?: Omit<Options, 'url'>): UsePost => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!url || !!context.url, 'usePost')

  const { data, loading, error, post } = useFetch<TData>(url, {
    method: HTTPMethod.POST,
    ...options
  })
  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, post],
    { data, loading, error, post }
  )
}
