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

export type FetchData = (routeOrBody?: string | object, body?: object) => Promise<void>
type GetData = (route?: string) => Promise<void>

export type FetchCommands = {
  get: GetData,
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

// useFetch argument types

export type UseFetchBaseOptions = {
  onMount?: boolean,
  timeout?: number
}

export type OptionsNoURLs = UseFetchBaseOptions & RequestInit

// No Provider
export type URLRequiredOptions = { url: string } & UseFetchBaseOptions & RequestInit

// type BaseURLRequiredOptions = { baseURL: string } & UseFetchBaseOptions & RequestInit

export type OptionsAsFirstParam = URLRequiredOptions// | BaseURLRequiredOptions

// With Provider
export type MaybeURLOptions = { url?: string } & UseFetchBaseOptions & RequestInit

// type MaybeBaseURLOptions = { baseURL?: string } & UseFetchBaseOptions & RequestInit

export type MaybeOptions = MaybeURLOptions //| MaybeBaseURLOptions

// TODO: this is still yet to be implemented
export type OptionsOverwriteWithContext = (options: MaybeOptions) => MaybeOptions

export type OptionsAsFirstParamWithContext = MaybeOptions | OptionsOverwriteWithContext

// Putting it all together
export type URLOrOptions = string | OptionsAsFirstParam | OptionsAsFirstParamWithContext

export type UseFetchOptions = OptionsAsFirstParam | MaybeOptions