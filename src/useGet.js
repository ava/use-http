import useFetch from './useFetch'

export const useGet = (url, options) => {
  const { data, loading, error, get } = useFetch(url, {
    method: 'GET',
    ...options
  })
  return Object.assign([ data, loading, error, get ], { data, loading, error, get })
}