import useFetch, { Options } from './useFetch'

export const useDelete = (url: string, options?: Options) => {
  const { data, loading, error, del } = useFetch(url, {
    method: 'DELETE',
    ...options
  })
  return Object.assign([ data, loading, error, del ], { data, loading, error, del, delete: del })
}
