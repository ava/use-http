import { createContext } from 'react'
import { FetchContextTypes } from "./types";

export const FetchContext = createContext<FetchContextTypes>({
  url: '',
  options: {},
  graphql: false, // TODO: this will make it so useFetch(QUERY || MUTATION) will work
})

export default FetchContext