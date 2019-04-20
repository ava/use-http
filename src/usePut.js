import useFetch from './useFetch'

export const usePut = (url, options) => {
  const { data, loading, error, put } = useFetch(url, {
    method: 'PUT',
    ...options
  })
  return Object.assign([ data, loading, error, put ], { data, loading, error, put })
}