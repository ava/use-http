/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetch, { FetchContext } from '.'
import { useContext, useCallback } from 'react'
import { UseFetchBaseResult } from './types'
import { invariant, isString, useURLRequiredInvariant } from './utils'

type ArrayDestructure<TData = any> = [TData | undefined, boolean, Error, (variables?: object) => Promise<any>]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  query: (variables?: object) => Promise<any>
}
type UseQuery = ArrayDestructure & ObjectDestructure

export const useQuery = <TData = any>(urlOrQuery: string | TemplateStringsArray, queryArg?: string): UseQuery => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(!!context.url && Array.isArray(urlOrQuery), 'useQuery')
  useURLRequiredInvariant(
    !!context.url && isString(urlOrQuery) && !queryArg,
    'useQuery',
    'OR you need to do useQuery("https://example.com", `your graphql query`)'
  )

  // regular no context: useQuery('https://example.com', `graphql QUERY`)
  let url = urlOrQuery
  let QUERY = queryArg as string

  // tagged template literal with context: useQuery`graphql QUERY`
  if (Array.isArray(urlOrQuery) && context.url) {
    invariant(!queryArg, 'You cannot have a 2nd argument when using tagged template literal syntax with useQuery.')
    url = context.url
    QUERY = urlOrQuery[0]

  // regular with context: useQuery(`graphql QUERY`)
  } else if (urlOrQuery && !queryArg && context.url) {
    url = context.url
    QUERY = urlOrQuery as string
  }

  const request = useFetch<TData>(url as string)

  const query = useCallback((variables?: object): Promise<any> => request.query(QUERY, variables), [QUERY, request])

  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [request.data, request.loading, request.error, query],
    {
      data: request.data,
      loading: request.loading,
      error: request.error,
      query,
    }
  )
}