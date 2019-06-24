import useFetch, { Options } from './useFetch'
import { HTTPMethod } from "./types";

export const usePut = <TData = any>(url: string, options?: Options) => {
  const { data, loading, error, put } = useFetch<TData>(url, {
    method: HTTPMethod.PUT,
    ...options
  })
  return Object.assign([data, loading, error, put], { data, loading, error, put })
}
