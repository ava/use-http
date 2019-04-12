import useFetch from './useFetch'

export const usePatch = (url, options) => {
  const response = useFetch(url, {
    method: 'PATCH',
    ...options
  })
  return response
}