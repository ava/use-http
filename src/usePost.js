import useFetch from './useFetch'

export const usePost = (url, options) => {
  const response = useFetch(url, {
    method: 'POST',
    ...options
  })
  return response
}