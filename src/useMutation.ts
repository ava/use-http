import useFetch, { FetchContext } from '.'
import { useContext, useCallback, useEffect } from 'react'
import { invariant, isString } from './utils'


export const useMutation = <TData = any>(arg1: string | TemplateStringsArray, arg2?: string) => {
  const context = useContext(FetchContext)

  // we should only need to check this on 1st render
  useEffect(() => {
    const case1 = !!context.url && Array.isArray(arg1)
    const case2 = !!context.url && isString(arg1) && !arg2
    invariant(case1 || case2, 'You need to wrap your application with <Provider url="https://your-site.com"></Provider>')
  }, [])

  // regular no context: useMutation('https://example.com', `graphql MUTATION`)
  let url = arg1
  let MUTATION = arg2 as string

  // tagged template literal with context: useMutation`graphql MUTATION`
  if (Array.isArray(arg1) && context.url) {
    invariant(!arg2, 'You cannot have a 2nd argument when using tagged template literal syntax with useMutation.')
    url = context.url
    MUTATION = arg1[0]

  // regular with context: useMutation(`graphql MUTATION`)
  } else if (arg1 && !arg2 && context.url) {
    url = context.url
    MUTATION = arg1 as string
  }

  const request = useFetch<TData>(url as string)

  const mutate = useCallback((inputs?: object) => request.mutate(MUTATION, inputs), [])

  return Object.assign([request.data, request.loading, request.error, mutate], { ...request, mutate })
}