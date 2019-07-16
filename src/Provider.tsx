import React, { useState, useEffect, useMemo, ReactElement } from 'react'
import useSSR from 'use-ssr'
import FetchContext from './FetchContext'
import { FetchContextTypes } from './types'

interface FetchProviderProps extends FetchContextTypes {
  children: ReactElement
}

export const Provider = ({ url, options, graphql = false, children }: FetchProviderProps): ReactElement => {
  const { isBrowser } = useSSR()
  const [defaultURL, setURL] = useState(url || '')

  useEffect((): void => {
    if (isBrowser && !url) setURL(window.location.origin)
  }, [url, isBrowser])

  const defaults = useMemo(
    (): FetchContextTypes => ({
      url: defaultURL,
      options: options || {},
      graphql, // TODO: this will make it so useFetch(QUERY || MUTATION) will work
    }),
    [options, graphql, defaultURL],
  )

  return (
    <FetchContext.Provider value={defaults}>
      {children}
    </FetchContext.Provider>
  )
}
