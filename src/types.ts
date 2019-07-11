/* eslint-disable @typescript-eslint/no-explicit-any */
export enum HTTPMethod {
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
}

export type BodyOnly = (body: object) => Promise<any>
export type RouteOnly = (route: string) => Promise<any>
export type RouteAndBodyOnly = (route: string, body: object) => Promise<any>
export type NoArgs = () => Promise<any>
// type RouteAndBody = (routeOrBody?: string | object, body?: object) => Promise<void>
// type FetchData = BodyOnly | RouteOnly | RouteAndBodyOnly | NoArgs
export type FetchData = (routeOrBody?: string | object, body?: object) => Promise<any>

export interface RequestInitJSON extends RequestInit {
  headers?: RequestInit['headers'] & {
    'Content-Type': string
  }
}

export interface FetchCommands {
  get: (route?: string) => Promise<any>
  post: FetchData
  patch: FetchData
  put: FetchData
  del: FetchData
  delete: FetchData
  query: (query: string, variables?: object) => Promise<any>
  mutate: (mutation: string, variables?: object) => Promise<any>
  abort: () => void
}

export type DestructuringCommands<TData = any> = [TData | undefined, boolean, any, FetchCommands]

export interface UseFetchBaseResult<TData = any> {
  data: TData | undefined
  loading: boolean
  error: Error
}

export type UseFetchResult<TData = any> = UseFetchBaseResult<TData> & FetchCommands & {
  request: FetchCommands
}

export type UseFetch<TData> = DestructuringCommands<TData> & UseFetchResult<TData>

export type Options = {
  onMount?: boolean
  timeout?: number
  url: string
} & RequestInit

export type OptionsMaybeURL = Omit<Options, 'url'> & { url?: string }

// TODO: this is still yet to be implemented
export type OptionsOverwriteWithContext = (options: Options) => Options
