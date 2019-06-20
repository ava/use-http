import React, { useState, useEffect, useMemo, ReactElement } from 'react'
import useSSR from 'use-ssr'
import URLContext from './URLContext'

interface FetchProviderProps {
	url?: string,
	options?: RequestInit,
	children: ReactElement,
	graphql?: boolean,
}

export const Provider = ({ url, options, graphql = false, children }: FetchProviderProps): ReactElement => {
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
		<URLContext.Provider value={defaults}>
			{children}
		</URLContext.Provider>
	)
}
