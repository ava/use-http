import { useEffect, useState, useCallback } from 'react'

export function useFetch(url, options) {
  // if on server, return loading
  if (!global.window) return [null, true, null]

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(url, options)
      const data = await response.json()
      setData(data)
      setLoading(false)
    } catch (err) {
      setError(err)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])
  return [data, loading, error]
}

export default useFetch