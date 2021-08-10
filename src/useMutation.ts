import { useContext, useCallback } from 'react'
import useFetch from './useFetch'
import { FetchContext } from './FetchContext'
import { ReqBase } from './types'
import { invariant, isString, useURLRequiredInvariant } from './utils'

type ArrayDestructure<TData = any> = [
  TData | undefined,
  boolean,
  Error | undefined,
  (variables?: object) => Promise<any>,
]
interface ObjectDestructure<TData = any> extends ReqBase<TData> {
  mutate: (variables?: object) => Promise<any>
}
type UseMutation<TData = any> = ArrayDestructure<TData> & ObjectDestructure<TData>

export const useMutation = <TData = any>(
  urlOrMutation: string | TemplateStringsArray,
  mutationArg?: string
): UseMutation<TData> => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(
    !!context.url && Array.isArray(urlOrMutation),
    'useMutation'
  )
  useURLRequiredInvariant(
    !!context.url || (isString(urlOrMutation) && !mutationArg),
    'useMutation',
    'OR you need to do useMutation("https://example.com", `your graphql mutation`)'
  )

  // regular no context: useMutation('https://example.com', `graphql MUTATION`)
  let url = urlOrMutation
  let MUTATION = mutationArg as string

  // tagged template literal with context: useMutation`graphql MUTATION`
  if (Array.isArray(urlOrMutation) && context.url) {
    invariant(
      !mutationArg,
      'You cannot have a 2nd argument when using tagged template literal syntax with useMutation.'
    )
    url = context.url
    MUTATION = urlOrMutation[0]

    // regular with context: useMutation(`graphql MUTATION`)
  } else if (urlOrMutation && !mutationArg && context.url) {
    url = context.url
    MUTATION = urlOrMutation as string
  }

  const { loading, error, cache, ...request } = useFetch<TData>(url as string)

  const mutate = useCallback(
    (inputs?: object): Promise<any> => request.mutate(MUTATION, inputs),
    [MUTATION, request]
  )

  const data = (request.data as TData & { data: any } || { data: undefined }).data

  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [data, loading, error, mutate],
    { data, loading, error, mutate, cache }
  )
}
