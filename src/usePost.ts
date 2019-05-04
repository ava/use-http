import useFetch, { Options } from './useFetch'

export const usePost = (url: string, options?: Options) => {
  const { data, loading, error, post } = useFetch(url, {
    method: 'POST',
    ...options
  })
  return Object.assign([ data, loading, error, post ], { data, loading, error, post })
}
