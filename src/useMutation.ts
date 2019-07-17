/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetch, { FetchContext } from '.'
import { useContext, useCallback } from 'react'
import { UseFetchBaseResult } from './types'
import { invariant, isString, useURLRequiredInvariant } from './utils'

type ArrayDestructure<TData = any> = [
  TData | undefined,
  boolean,
  Error,
  (variables?: object) => Promise<any>,
]
interface ObjectDestructure<TData = any> extends UseFetchBaseResult<TData> {
  mutate: (variables?: object) => Promise<any>
}
type UseMutation = ArrayDestructure & ObjectDestructure

export const useMutation = <TData = any>(
  urlOrMutation: string | TemplateStringsArray,
  mutationArg?: string,
): UseMutation => {
  const context = useContext(FetchContext)

  useURLRequiredInvariant(
    !!context.url && Array.isArray(urlOrMutation),
    'useMutation',
  )
  useURLRequiredInvariant(
    !!context.url && isString(urlOrMutation) && !mutationArg,
    'useMutation',
    'OR you need to do useMutation("https://example.com", `your graphql mutation`)',
  )

  // regular no context: useMutation('https://example.com', `graphql MUTATION`)
  let url = urlOrMutation
  let MUTATION = mutationArg as string

  // tagged template literal with context: useMutation`graphql MUTATION`
  if (Array.isArray(urlOrMutation) && context.url) {
    invariant(
      !mutationArg,
      'You cannot have a 2nd argument when using tagged template literal syntax with useMutation.',
    )
    url = context.url
    MUTATION = urlOrMutation[0]

    // regular with context: useMutation(`graphql MUTATION`)
  } else if (urlOrMutation && !mutationArg && context.url) {
    url = context.url
    MUTATION = urlOrMutation as string
  }

  const request = useFetch<TData>(url as string)

  const mutate = useCallback(
    (inputs?: object): Promise<any> => request.mutate(MUTATION, inputs),
    [MUTATION, request],
  )

  return Object.assign<ArrayDestructure<TData>, ObjectDestructure<TData>>(
    [request.data, request.loading, request.error, mutate],
    {
      data: request.data,
      loading: request.loading,
      error: request.error,
      mutate,
    },
  )
}
