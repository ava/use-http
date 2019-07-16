import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, NoUrlOptions } from './types'
import { useURLRequiredInvariant } from './utils'

export const usePatch = <TData = any>(url?: string, options?: NoUrlOptions) => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!url || !!context.url, 'usePatch')

  const { data, loading, error, patch } = useFetch<TData>(url, {
    method: HTTPMethod.PATCH,
    ...options
  })
  return Object.assign([data, loading, error, patch], { data, loading, error, patch })
}
