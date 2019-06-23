import useFetch, { Options } from './useFetch'
import { HTTPMethod } from "./types";

export const useGet = <TData = any>(url: string, options?: Options) => {
  const { data, loading, error, get } = useFetch<TData>(url, {
    method: HTTPMethod.GET,
    ...options
  })
  return Object.assign([data, loading, error, get], { data, loading, error, get })
}
