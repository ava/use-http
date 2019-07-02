export enum HTTPMethod {
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
}

export type BodyOnly = (body: BodyInit) => Promise<void>
export type RouteOnly = (route: string) => Promise<void>
export type RouteAndBodyOnly = (route: string, body: BodyInit) => Promise<void>
export type NoArgs = () => Promise<void>
// type RouteAndBody = (routeOrBody?: string | object, body?: object) => Promise<void>
type FetchData = BodyOnly | RouteOnly | RouteAndBodyOnly | NoArgs

export type FetchCommands = {
  get: RouteOnly & NoArgs,
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

export type UseFetch<TData> = DestructuringCommands<TData> & UseFetchResult<TData>

export type Options = {
  onMount?: boolean,
  timeout?: number,
  url: string,
} & RequestInit

export type OptionsMaybeURL = Omit<Options, 'url'> & { url?: string }

// TODO: this is still yet to be implemented
export type OptionsOverwriteWithContext = (options: Options) => Options
