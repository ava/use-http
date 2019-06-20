import { createContext } from 'react'


export const URLContext = createContext({
  url: typeof window !== 'undefined' ? window.location.origin : '',
  options: {},
  graphql: false, // TODO: this will make it so useFetch(QUERY || MUTATION) will work
})

export default URLContext