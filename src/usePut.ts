import { useContext } from 'react'
import useFetch, { FetchContext } from '.'
import { HTTPMethod, Options } from './types'
import { useURLRequiredInvariant } from './utils'

export const usePut = <TData = any>(url?: string, options?: Omit<Options, 'url'>) => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!url || !!context.url, 'usePut')

  const { data, loading, error, put } = useFetch<TData>(url, {
    method: HTTPMethod.PUT,
    ...options
  })
  return Object.assign([data, loading, error, put], { data, loading, error, put })
}
