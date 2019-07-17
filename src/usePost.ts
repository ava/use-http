import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, NoUrlOptions } from './types'
import { useURLRequiredInvariant } from './utils'

export const usePost = <TData = any>(url?: string, options?: NoUrlOptions) => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!url || !!context.url, 'usePost')

  const { data, loading, error, post } = useFetch<TData>(url, {
    method: HTTPMethod.POST,
    ...options,
  })
  return Object.assign([data, loading, error, post], {
    data,
    loading,
    error,
    post,
  })
}
