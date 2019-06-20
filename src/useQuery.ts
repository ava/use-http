import useFetch, { URLContext } from '.'
import { useContext, useCallback } from 'react';


export const useQuery = (arg1: string, arg2: string) => {
  const context = useContext(URLContext)

  let url = arg1
  let QUERY = arg2

  if (arg1 && !arg2 && context.url) {
    url = context.url
    QUERY = arg1
  }

  const request = useFetch(url)

  const query = useCallback(inputs => request.query(QUERY, inputs), [])

  return Object.assign([request.data, request.loading, request.error, query], { ...request, query })
}