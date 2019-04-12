import useFetch from './useFetch'

export const usePut = (url, options) => {
  const response = useFetch(url, {
    method: 'PUT',
    ...options
  })
  return response
}