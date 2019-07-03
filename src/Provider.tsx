import React, { useState, useEffect, useMemo, ReactNode } from 'react'
import useSSR from 'use-ssr'
import FetchContext from './FetchContext'

interface FetchProviderProps {
  url?: string,
  options?: RequestInit,
  children: ReactNode,
  graphql?: boolean,
}

export const Provider = ({ url, options, graphql = false, children }: FetchProviderProps) => {
  const { isBrowser } = useSSR()
  const [defaultURL, setURL] = useState(url || '')

  useEffect(() => {
    if (isBrowser && !url) setURL(window.location.origin)
  }, [url, isBrowser])

  const defaults = useMemo(
    () => ({
      url: defaultURL,
      options: options || {},
      graphql, // TODO: this will make it so useFetch(QUERY || MUTATION) will work
    }),
    [url, options, graphql],
  )

  return (
    <FetchContext.Provider value={defaults}>
      {children}
    </FetchContext.Provider>
  )
}
