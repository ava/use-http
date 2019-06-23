import useFetch, { URLContext } from '.'
import { useContext, useCallback } from 'react';


export const useMutation = <TData = any>(arg1: string, arg2: string) => {
  const context = useContext(URLContext)

  let url = arg1
  let MUTATION = arg2

  if (arg1 && !arg2 && context.url) {
    url = context.url
    MUTATION = arg1
  }

  const request = useFetch<TData>(url)

  const mutate = useCallback(inputs => request.mutate(MUTATION, inputs), [])

  return Object.assign([request.data, request.loading, request.error, mutate], { ...request, mutate })
}