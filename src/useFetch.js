import { useEffect, useCallback, useReducer } from 'react'

const initialState = {
  data: null,
  loading: true,
  error: null
}

function reducer(state, action) {
  switch (action.type) {
    case 'request':
      return { ...state, loading: true }
    case 'success':
      return { data: action.payload, loading: false, error: null }
    case 'fail':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

export function useFetch(url, options) {
  // if on server, return loading
  if (typeof window === 'undefined') return Object.assign([null, true, null], { data: null, loading: true, error: null })
  
//   const [data, setData] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
  const [{ data, loading, error }, dispatch] = useReducer(reducer, initialState)

  const fetchData = useCallback(async () => {
    try {
      dispatch({ type: 'request' })
      const response = await fetch(url, options)
      let data = null
      try {
        data = await response.json()
      } catch (Error) {
        data = await response.text()
      }
      dispatch({ type: 'success', payload: data })
    } catch (err) {
      dispatch({ type: 'fail', payload: err })
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return Object.assign([data, loading, error], { data, loading, error })
}

export default useFetch
