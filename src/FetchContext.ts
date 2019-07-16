import { createContext } from 'react'
import { FetchContextTypes } from "./types";

export const FetchContext = createContext<FetchContextTypes>({
  url: typeof window !== 'undefined' ? window.location.origin : '',
  options: {},
  graphql: false, // TODO: this will make it so useFetch(QUERY || MUTATION) will work
})

export default FetchContext