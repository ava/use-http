import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, NoUrlOptions } from './types'
import { useURLRequiredInvariant } from './utils'

export const useGet = <TData = any>(url?: string, options?: NoUrlOptions) => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!url || !!context.url, 'useGet')

  const { data, loading, error, get } = useFetch<TData>(url, {
    method: HTTPMethod.GET,
    ...options
  })
  return Object.assign([data, loading, error, get], { data, loading, error, get })
}
