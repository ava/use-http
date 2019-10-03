export enum HTTPMethod {
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
}

export interface FetchContextTypes {
  url?: string
  options?: Options | undefined
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

export interface ReqMethods {
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

export interface Data<TData> {
  data: TData | undefined
}

export interface ReqBase<TData> {
  data: TData | undefined
  loading: boolean
  error: Error
}

export interface Res<TData> extends Response {
  data: TData | undefined
}

export type Req<TData = any> = ReqMethods & ReqBase<TData>

export type UseFetchArgs = [(string | OptionsMaybeURL)?, NoUrlOptions?]

export type UseFetchArrayReturn<TData> = [
  Req<TData>,
  Res<TData>,
  boolean,
  Error,
]

export type UseFetchObjectReturn<TData> = ReqBase<TData> &
  ReqMethods & {
    request: Req<TData>
    response: Res<TData>
  }

export type UseFetch<TData> = UseFetchArrayReturn<TData> &
  UseFetchObjectReturn<TData>

export type Interceptors = {
  request?: (options: Options) => Options
  response?: (response: Res<any>) => any
}

export interface CustomOptions {
  onMount?: boolean
  onUpdate?: any[]
  timeout?: number
  path?: string
  url?: string
  loading?: boolean
  data?: any
  interceptors?: Interceptors
}

export type Options = CustomOptions &
  Omit<RequestInit, 'body'> & { body?: BodyInit | object | null }

export type NoUrlOptions = Omit<Options, 'url'>

export type OptionsMaybeURL = NoUrlOptions &
  Partial<Pick<Options, 'url'>> & { url?: string }

// TODO: this is still yet to be implemented
export type OptionsOverwriteWithContext = (options: Options) => Options

/**
 * Helpers
 */
export type ValueOf<T> = T[keyof T]

export type NonObjectKeysOf<T> = {
  [K in keyof T]: T[K] extends Array<any> ? K : T[K] extends object ? never : K
}[keyof T]

export type ObjectValuesOf<T extends Object> = Exclude<
  Exclude<Extract<ValueOf<T>, object>, never>,
  Array<any>
>

export type UnionToIntersection<U> = (U extends any
  ? (k: U) => void
  : never) extends ((k: infer I) => void)
  ? I
  : never

export type Flatten<T> = Pick<T, NonObjectKeysOf<T>> & UnionToIntersection<ObjectValuesOf<T>>