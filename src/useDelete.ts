import useFetch, { Options } from './useFetch'
import { HTTPMethod } from "./types";

export const useDelete = <TData = any>(url: string, options?: Options) => {
  const { data, loading, error, del } = useFetch<TData>(url, {
    method: HTTPMethod.DELETE,
    ...options
  })
  return Object.assign([data, loading, error, del], { data, loading, error, del, delete: del })
}
