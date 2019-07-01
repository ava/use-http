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

type BodyOnly = (body?: object) => Promise<void>
type RouteOnly = (route?: string) => Promise<void>
type RouteAndBody = (routeOrBody?: string | object, body?: object) => Promise<void>
type FetchData = BodyOnly | RouteOnly | RouteAndBody

export type FetchCommands = {
  get: RouteOnly,
  post: FetchData,
  patch: FetchData,
  put: FetchData,
  del: FetchData,
  delete: FetchData,
  query: (query: string, variables?: object) => Promise<void>,
  mutate: (mutation: string, variables?: object) => Promise<void>,
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