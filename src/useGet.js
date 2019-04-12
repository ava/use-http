import useFetch from './useFetch'

export const useGet = (url, options) => {
  const response = useFetch(url, {
    method: 'GET',
    ...options
  })
  return response
}