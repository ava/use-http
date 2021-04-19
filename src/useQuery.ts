import { useContext, useCallback } from 'react'
import useFetch from './useFetch'
import { FetchContext } from './FetchContext'
import { ReqBase, Cache } from './types'
import { invariant, isString, useURLRequiredInvariant } from './utils'

type ArrayDestructure<TData = any> = [
  TData | undefined,
  boolean,
  Error,
  (variables?: object) => Promise<any>,
]
interface ObjectDestructure<TData = any> extends ReqBase<TData> {
  query: (variables?: object) => Promise<any>
  cache: Cache
}
type UseQuery<TData = any> = ArrayDestructure<TData> & ObjectDestructure<TData>

export const useQuery = <TData = any>(
  urlOrQuery: string | TemplateStringsArray,
  queryArg?: string
): UseQuery<TData> => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(
    !!context.url && Array.isArray(urlOrQuery),
    'useQuery'
  )
  useURLRequiredInvariant(
    !!context.url || (isString(urlOrQuery) && !queryArg),
    'useQuery',
    'OR you need to do useQuery("https://example.com", `your graphql query`)'
  )

  // regular no context: useQuery('https://example.com', `graphql QUERY`)
  let url = urlOrQuery
  let QUERY = queryArg as string

  // tagged template literal with context: useQuery`graphql QUERY`
  if (Array.isArray(urlOrQuery) && context.url) {
    invariant(
      !queryArg,
      'You cannot have a 2nd argument when using tagged template literal syntax with useQuery.'
    )
    url = context.url
    QUERY = urlOrQuery[0]

    // regular with context: useQuery(`graphql QUERY`)
  } else if (urlOrQuery && !queryArg && context.url) {
    url = context.url
    QUERY = urlOrQuery as string
  }

  const { loading, error, cache, ...request } = useFetch<TData>(url as string)

  const query = useCallback(
    (variables?: object): Promise<any> => request.query(QUERY, variables),
    [QUERY, request]
  )

  const data = (request.data as TData & { data: any } || { data: undefined }).data

  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, query],
    { data, loading, error, query, cache }
  )
}
