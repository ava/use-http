import useFetch, { Options } from './useFetch'

export const useGet = (url: string, options?: Options) => {
  const { data, loading, error, get } = useFetch(url, {
    method: 'GET',
    ...options
  })
  return Object.assign([ data, loading, error, get ], { data, loading, error, get })
}
