import { useEffect, useState, useCallback } from 'react'

export function useFetch(url, options) {
  // if on server, return loading
  if (typeof window === 'undefined') return Object.assign([null, true, null], { data: null, loading: true, error: null })

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(url, options)
      let data = null
      try {
        data = await response.json()
      } catch (Error) {
        data = await response.text()
      }
      setData(data)
      setLoading(false)
    } catch (err) {
      setError(err)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return Object.assign([data, loading, error], { data, loading, error })
}

export default useFetch
