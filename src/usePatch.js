import useFetch from './useFetch'

export const usePatch = (url, options) => {
  const { data, loading, error, patch } = useFetch(url, {
    method: 'PATCH',
    ...options
  })
  return Object.assign([ data, loading, error, patch ], { data, loading, error, patch })
}