import { createContext } from 'react'


type FetchContextTypes = {
  url?: string,
  options?: RequestInit | undefined,
  graphql?: boolean,
}

export const FetchContext = createContext<FetchContextTypes>({
  url: typeof window !== 'undefined' ? window.location.origin : '',
  options: {},
  graphql: false, // TODO: this will make it so useFetch(QUERY || MUTATION) will work
})

export default FetchContext