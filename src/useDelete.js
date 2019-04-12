import useFetch from './useFetch'

export const useDelete = (url, options) => {
  const response = useFetch(url, {
    method: 'DELETE',
    ...options
  })
  return response
}