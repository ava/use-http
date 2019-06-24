import useFetch, { Options } from './useFetch'
import { HTTPMethod } from "./types";

export const usePatch = <TData = any>(url: string, options?: Options) => {
  const { data, loading, error, patch } = useFetch<TData>(url, {
    method: HTTPMethod.PATCH,
    ...options
  })
  return Object.assign([data, loading, error, patch], { data, loading, error, patch })
}
