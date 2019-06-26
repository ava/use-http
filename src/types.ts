export enum HTTPMethod {
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
}

export interface Options {
  url?: string
  onMount?: boolean
  method?: string
  timeout?: number
  baseUrl?: string
}

export type FetchData = (fArg1?: string | object | undefined, fArg2?: string | object | undefined) => Promise<void>

export type FetchCommands = {
  get: FetchData,
  post: FetchData,
  patch: FetchData,
  put: FetchData,
  del: FetchData,
  delete: FetchData,
  query: (query?: string | undefined, variables?: object | undefined) => Promise<void>,
  mutate: (mutation?: string | undefined, variables?: object | undefined) => Promise<void>,
  abort: () => void
}

export type DestructuringCommands<TData = any> = [TData | undefined, boolean, any, FetchCommands]

export type UseFetchResult<TData = any> = FetchCommands & {
  data?: TData,
  loading: boolean,
  error?: any,
  request: FetchCommands,
}

export type useFetchArg1 = string | Options & RequestInit

export type UseFetch<TData> = DestructuringCommands<TData> & UseFetchResult<TData>

export type UseFetchOptions = Options & RequestInit;
