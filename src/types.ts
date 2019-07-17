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

export interface FetchContextTypes {
  url?: string
  options?: RequestInit | undefined
  graphql?: boolean
}

export type BodyOnly = (body: BodyInit | object) => Promise<any>
export type RouteOnly = (route: string) => Promise<any>
export type RouteAndBodyOnly = (
  route: string,
  body: BodyInit | object,
) => Promise<any>
export type NoArgs = () => Promise<any>
// type RouteAndBody = (routeOrBody?: string | object, body?: object) => Promise<void>
// type FetchData = BodyOnly | RouteOnly | RouteAndBodyOnly | NoArgs
export type FetchData = (
  routeOrBody?: string | BodyInit | object,
  body?: BodyInit | object,
) => Promise<any>

export type RequestInitJSON = RequestInit & {
  headers: {
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
  query: (query: string, variables?: BodyInit | object) => Promise<any>
  mutate: (mutation: string, variables?: BodyInit | object) => Promise<any>
  abort: () => void
}

export type DestructuringCommands<TData = any> = [
  TData | undefined,
  boolean,
  any,
  FetchCommands,
]

export interface UseFetchBaseResult<TData = any> {
  data: TData | undefined
  loading: boolean
  error: Error
}

export type UseFetchResult<TData = any> = UseFetchBaseResult<TData> &
  FetchCommands & {
    request: FetchCommands
  }

export type UseFetch<TData> = DestructuringCommands<TData> &
  UseFetchResult<TData>

export interface CustomOptions {
  onMount?: boolean
  timeout?: number
  url: string
}

export type Options = CustomOptions & Omit<RequestInit, 'body'> & { body?: BodyInit | object | null }


export type NoUrlOptions = Omit<Options, 'url'>

export type OptionsMaybeURL = NoUrlOptions &
  Partial<Pick<Options, 'url'>> & { url?: string }

// TODO: this is still yet to be implemented
export type OptionsOverwriteWithContext = (options: Options) => Options
