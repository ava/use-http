import useFetch from './useFetch'
import { HTTPMethod, Options } from './types'

export const useDelete = <TData = any>(url: string, options?: Options) => {
  const { data, loading, error, del } = useFetch<TData>(url, {
    method: HTTPMethod.DELETE,
    ...options
  })
  return Object.assign([data, loading, error, del], { data, loading, error, del, delete: del })
}
