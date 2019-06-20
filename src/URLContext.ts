import { createContext } from 'react'


type URLContextTypes = {
  url?: string,
  options?: RequestInit | undefined,
  graphql?: boolean,
}

export const URLContext = createContext<URLContextTypes>({
  url: typeof window !== 'undefined' ? window.location.origin : '',
  options: {},
  graphql: false, // TODO: this will make it so useFetch(QUERY || MUTATION) will work
})

export default URLContext