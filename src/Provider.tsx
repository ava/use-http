import React, { useMemo, ReactElement } from 'react'
import useSSR from 'use-ssr'
import FetchContext from './FetchContext'
import { FetchContextTypes } from './types'

interface FetchProviderProps extends FetchContextTypes {
  children: ReactElement
}

export const Provider = ({ url, options, graphql = false, children }: FetchProviderProps): ReactElement => {
  const { isBrowser } = useSSR()

  const defaults = useMemo(
    (): FetchContextTypes => ({
      url: url || (isBrowser ? window.location.origin : ''),
      options: options || {},
      graphql, // TODO: this will make it so useFetch(QUERY || MUTATION) will work
    }),
    [options, graphql],
  )

  return (
    <FetchContext.Provider value={defaults}>
      {children}
    </FetchContext.Provider>
  )
}
