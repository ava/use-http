import useFetch, { Options } from './useFetch'
import { HTTPMethod } from "./types";

export const usePost = <TData = any>(url: string, options?: Options) => {
  const { data, loading, error, post } = useFetch<TData>(url, {
    method: HTTPMethod.POST,
    ...options
  })
  return Object.assign([data, loading, error, post], { data, loading, error, post })
}
