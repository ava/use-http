import useFetch, { Options } from './useFetch'

export const usePut = (url: string, options?: Options) => {
  const { data, loading, error, put } = useFetch(url, {
    method: 'PUT',
    ...options
  })
  return Object.assign([ data, loading, error, put ], { data, loading, error, put })
}
