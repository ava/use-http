import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, Options } from './types'
import { useURLRequiredInvariant } from './utils'

export const useDelete = <TData = any>(url?: string, options?: Options) => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!url || !!context.url, 'useDelete')

  const { data, loading, error, del } = useFetch<TData>(url, {
    method: HTTPMethod.DELETE,
    ...options
  })
  return Object.assign([data, loading, error, del], { data, loading, error, del, delete: del })
}
