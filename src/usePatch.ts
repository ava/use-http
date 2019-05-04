import useFetch, { Options } from './useFetch'

export const usePatch = (url: string, options?: Options) => {
  const { data, loading, error, patch } = useFetch(url, {
    method: 'PATCH',
    ...options
  })
  return Object.assign([ data, loading, error, patch ], { data, loading, error, patch })
}
