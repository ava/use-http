/* eslint-disable no-var */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
import React, { Suspense, ReactElement, ReactNode } from 'react'
import { useFetch, Provider } from '..'
import { cleanup } from '@testing-library/react'
import { FetchMock } from 'jest-fetch-mock'
import { Res, Options, CachePolicies } from '../types'
import { toCamel } from 'convert-keys'
import { renderHook, act } from '@testing-library/react-hooks'
import { emptyCustomResponse, sleep } from '../utils'
import * as test from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

import * as mockdate from 'mockdate'

const fetch = global.fetch as FetchMock

const { NO_CACHE, NETWORK_ONLY } = CachePolicies


describe('useFetch - BROWSER - basic functionality', (): void => {
  const expected = {
    name: 'Alex Cory',
    age: 29
  }

  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => <Provider url="https://example.com" options={{ cachePolicy: NO_CACHE }}>{children}</Provider>

  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(JSON.stringify(expected))
  })

  it('should execute GET command with object destructuring', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('https://example.com', []), // onMount === true
      { wrapper: wrapper as React.ComponentType }
    )

    expect(result.current.data).toBe(undefined)
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(undefined)
    expect(result.current.request.data).toBe(undefined)
    expect(result.current.response.data).toEqual(undefined)
    expect(result.current.request.loading).toBe(true)

    await waitForNextUpdate()

    expect(result.current.request.data).toEqual(expected)
    expect(result.current.data).toEqual(expected)
    expect(result.current.response.data).toEqual(expected)
    expect(result.current.request.loading).toBe(false)
    expect(result.current.loading).toBe(false)

    expect(typeof result.current.get).toBe('function')
    expect(typeof result.current.post).toBe('function')
    expect(typeof result.current.patch).toBe('function')
    expect(typeof result.current.put).toBe('function')
    expect(typeof result.current.delete).toBe('function')
    expect(typeof result.current.del).toBe('function')
    expect(typeof result.current.abort).toBe('function')
    expect(typeof result.current.query).toBe('function')
    expect(typeof result.current.mutate).toBe('function')
  })

  it('should execute GET command with arrray destructuring', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('sweet', []), // onMount === true
      { wrapper: wrapper as React.ComponentType }
    )
    var [request, response, loading, error] = result.current
    expect(request.loading).toBe(true)
    expect(loading).toBe(true)
    expect(error).toBe(undefined)
    await waitForNextUpdate()
    // eslint-disable-next-line no-redeclare
    var [request, response, loading] = result.current
    expect(response.data).toEqual(expected)
    expect(request.loading).toBe(false)
    expect(loading).toBe(false)
  })
})

describe('useFetch - BROWSER - with <Provider />', (): void => {
  const expected = {
    name: 'Alex Cory',
    age: 29
  }

  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
    <Provider url='https://example.com' options={{ cachePolicy: NO_CACHE }}>{children}</Provider>
  )

  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(JSON.stringify(expected))
  })

  it('should work correctly: useFetch({ onMount: true, data: [] })', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ data: {} }, []), // onMount === true
      { wrapper }
    )

    expect(result.current.data).toEqual({})
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should execute GET using Provider url', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ data: {} }, []), // onMount === true
      { wrapper }
    )

    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should execute GET using Provider url: request = useFetch(), request.get()', async (): Promise<
    void
  > => {
    const { result } = renderHook(() => useFetch(), { wrapper })
    expect(result.current.loading).toBe(false)
    await result.current.get()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should execute GET using Provider url: request = useFetch(), request.get("/people")', async (): Promise<
    void
  > => {
    const { result } = renderHook(() => useFetch(), { wrapper })
    expect(result.current.loading).toBe(false)
    await result.current.get('/people')
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should merge the data onNewData for pagination', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({
        path: '/people',
        data: { no: 'way' },
        onNewData: (currData, newData) => ({ ...currData, ...newData })
      }, []), // onMount === true
      { wrapper }
    )
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual({
      ...expected,
      no: 'way'
    })
  })

  it('should not make another request when there is no more data `perPage` pagination', async (): Promise<
    void
  > => {
    fetch.resetMocks()
    const expected1 = [1, 2, 3]
    fetch.mockResponse(
      JSON.stringify(expected1)
    )
    let page = 1
    const { result, rerender, waitForNextUpdate } = renderHook(
      () => useFetch(`https://example.com?page=${page}`, {
        data: [],
        perPage: 3,
        onNewData: (currData, newData) => {
          // to imitate getting a response with less items
          if (page === 2) return [...currData, 4]
          return [...currData, ...newData]
        }
      }, [page]) // onMount === true
    )
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(expected1)
    page = 2
    rerender()
    await waitForNextUpdate()
    expect(result.current.data).toEqual([...expected1, 4])
    expect(fetch.mock.calls.length).toBe(2)
    page = 3
    rerender()
    expect(result.current.data).toEqual([...expected1, 4])
    expect(fetch.mock.calls.length).toBe(2)
  })

  it('should execute GET using Provider url: useFetch({ path: "/people" }, [])', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ path: '/people' }, []), // onMount === true
      { wrapper }
    )
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
    // TODO: test if you do a post('/alex'), if the url is /people/alex
  })
})

describe('timeouts', (): void => {
  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
    <Provider url='https://example.com' options={{ cachePolicy: NO_CACHE }}>{children}</Provider>
  )
  const timeout = 10

  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
    jest.useRealTimers()
  })

  beforeEach((): void => {
    fetch.resetMocks()
    fetch.mockReject((): any => {
      jest.advanceTimersByTime(timeout)
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({ name: 'AbortError', message: 'The user aborted a request.' })
    })
    jest.useFakeTimers()
  })

  it(`should execute GET and timeout after ${timeout}ms, and fire 'onTimeout' and 'onAbort'`, async (): Promise<
    void
  > => {
    const onAbort = jest.fn()
    const onTimeout = jest.fn()
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({
        timeout,
        onAbort,
        onTimeout,
        retries: 0 // TODO: IMPORTANT!! this times out when we don't have this set to 0
      }, []), // onMount === true
      { wrapper }
    )
    expect(fetch).toHaveBeenCalledTimes(0)
    expect(onAbort).not.toBeCalled()
    expect(onTimeout).not.toBeCalled()
    expect(onAbort).toHaveBeenCalledTimes(0)
    expect(onTimeout).toHaveBeenCalledTimes(0)
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.error.name).toBe('AbortError')
    expect(result.current.error.message).toBe('Timeout Error')
    expect(onAbort).toBeCalled()
    expect(onTimeout).toBeCalled()
    expect(onAbort).toHaveBeenCalledTimes(1)
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it(`should execute GET, fail after ${timeout}ms, then retry 1 additional time`, async (): Promise<
    void
  > => {
    const onAbort = jest.fn()
    const onTimeout = jest.fn()
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({
        retries: 1,
        // TODO: IMPORTANT!! this test fails if `retryDelay > 0`
        retryDelay: 0,
        timeout,
        path: '/todos',
        onAbort,
        onTimeout
      }, []), // onMount === true
      { wrapper }
    )
    expect(onAbort).not.toBeCalled()
    expect(onTimeout).not.toBeCalled()
    expect(onAbort).toHaveBeenCalledTimes(0)
    expect(onTimeout).toHaveBeenCalledTimes(0)
    expect(result.current.loading).toBe(true)

    // jest.advanceTimersByTime(defaults.retryDelay)
    await waitForNextUpdate()
    expect(fetch.mock.calls[0][0]).toBe('https://example.com/todos')
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(result.current.loading).toBe(false)
    expect(result.current.error.name).toBe('AbortError')
    expect(result.current.error.message).toBe('Timeout Error')
    expect(onAbort).toBeCalled()
    expect(onTimeout).toBeCalled()
    expect(onAbort).toHaveBeenCalledTimes(2)
    expect(onTimeout).toHaveBeenCalledTimes(2)
    // jest.runAllTimers()
  })
})

describe('caching - useFetch - BROWSER', (): void => {
  const expected = { title: 'Alex Cory' }

  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  beforeEach((): void => {
    fetch.resetMocks()
    fetch.mockResponse(JSON.stringify(expected))
  })

  it('should not make a second request to the same url + route for `cache-first` cachePolicy', async (): Promise<void> => {
    // run the request on mount
    const { result, waitForNextUpdate } = renderHook(() => useFetch('https://example.com/todos', []))
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(expected)
    // make a 2nd request
    const responseData = await result.current.get()
    expect(responseData).toEqual(expected)
    expect(result.current.data).toEqual(expected)
    expect(fetch.mock.calls.length).toBe(1)
    expect(result.current.loading).toBe(false)
  })

  it('should still have a `response` promise even when being cached. `cache-first` cachePolicy (object destructuring)', async (): Promise<void> => {
    // run the request on mount
    const { result, waitForNextUpdate } = renderHook(() => useFetch('url-cache/object', []))
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    const { response } = result.current
    expect(result.current.loading).toBe(false)
    let text
    let json
    await act(async () => {
      json = await result.current.get()
      text = await response.text()
    })
    expect(text).toBe(JSON.stringify(expected))
    expect(json).toEqual(expected)
  })

  it('should still have a `response` promise even when being cached. `cache-first` cachePolicy (array destructuring)', async (): Promise<void> => {
    // run the request on mount
    const { result, waitForNextUpdate } = renderHook(() => useFetch('url-cache/array', []))
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    var [, response] = result.current
    expect(result.current.loading).toBe(false)
    const json = await result.current.get()
    const text = await response.text()
    expect(text).toBe(JSON.stringify(expected))
    expect(json).toEqual(expected)
  })

  it('should make a second request if cacheLife has exprired. `cache-first` cachePolicy', async (): Promise<void> => {
    // run the request on mount
    const { result, waitForNextUpdate } = renderHook(() => useFetch('https://example.com', {
      cacheLife: 1
    }, []))
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(expected)
    expect(fetch.mock.calls.length).toEqual(1)
    // wait ~20ms to allow cache to expire
    await sleep(20)
    // make a 2nd request
    await result.current.get()
    expect(result.current.data).toEqual(expected)
    // since the request most likely took longer than 1ms, we have 2 http requests
    expect(fetch.mock.calls.length).toBe(2)
    expect(result.current.loading).toBe(false)
  })
})

describe('useFetch - BROWSER - with <Provider /> - Managed State', (): void => {
  const expected = { title: 'Alex Cory' }
  const second = { title: 'Max Quinn' }

  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
    <Provider url='https://example.com'>{children}</Provider>
  )

  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  beforeEach((): void => {
    fetch.once(JSON.stringify(expected)).once(JSON.stringify(second))
  })

  it('should return response data when awaiting. i.e. const todos = await get("/todos")', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch(),
      { wrapper: wrapper as React.ComponentType }
    )
    expect(result.current.loading).toBe(false)
    const responseData = await result.current.post('/people', expected)
    expect(responseData).toEqual(expected)
    expect(result.current.data).toEqual(expected)
    expect(result.current.loading).toBe(false)
  })

  it('should re-run the request when onUpdate dependencies are updated', async (): Promise<void> => {
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ initialValue }) => useFetch({
        path: `/${initialValue}`,
        data: {}
      }, [initialValue]), // (onMount && onUpdate) === true
      {
        wrapper,
        initialProps: { initialValue: 0 }
      }
    )
    // Default data
    expect(result.current.data).toEqual({})

    // Expected First Payload
    await waitForNextUpdate()
    expect(result.current.data).toEqual(expected)

    // Expected Second Payload
    rerender({ initialValue: 1 })
    await waitForNextUpdate()
    expect(result.current.data).toEqual(second)
  })

  it('should fetch cached data when cached path is requested', async (): Promise<void> => {
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ initialValue }) => useFetch({
        path: `/a/${initialValue}`,
        data: {},
        retries: 0
      }, [initialValue]), // (onMount && onUpdate) === true
      {
        wrapper,
        initialProps: {
          initialValue: 0
        }
      }
    )
    // Default data
    expect(result.current.data).toEqual({})

    // Expected First payload
    await waitForNextUpdate()
    expect(result.current.data).toEqual(expected)

    // Expected second payload
    rerender({ initialValue: 1 })
    await waitForNextUpdate()
    expect(result.current.data).toEqual(second)

    // Expected first payload again
    rerender({ initialValue: 0 })
    await waitForNextUpdate()
    expect(result.current.data).toEqual(expected)
  })
})

describe('useFetch - BROWSER - interceptors', (): void => {
  const snake_case = { title: 'Alex Cory', first_name: 'Alex' }
  const expected = { title: 'Alex Cory', firstName: 'Alex' }

  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => {
    const options: Options = {
      interceptors: {
        request: async (opts, url, path, route) => {
          if (path === '/path') {
            opts.data = 'path'
          }
          if (url === 'url') {
            opts.data = 'url'
          }
          if (route === '/route') {
            opts.data = 'route'
          }
          return opts
        },
        async response(res) {
          if (res.data) res.data = toCamel(res.data)
          return res
        }
      },
      cachePolicy: NO_CACHE
    }
    return (
      <Provider url='https://example.com' options={options}>{children}</Provider>
    )
  }

  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(
      JSON.stringify(snake_case)
    )
  })

  it('should pass the proper response object for `interceptors.response`', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    await result.current.get()
    expect(result.current.response.ok).toBe(true)
    expect(result.current.response.data).toEqual(expected)
  })

  it('should have the `data` field correctly set when using a response interceptor', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch({ retries: 0 }),
      { wrapper }
    )
    await result.current.get()
    expect(result.current.response.ok).toBe(true)
    expect(result.current.data).toEqual(expected)
  })

  it('should pass the proper path string to `interceptors.request`', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch({ path: '/path' }),
      { wrapper }
    )
    await result.current.get()
    expect((fetch.mock.calls[0][1] as any).data).toEqual('path')
  })

  it('should pass the proper route string to `interceptors.request`', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    await result.current.get('/route')
    expect((fetch.mock.calls[0][1] as any).data).toEqual('route')
  })

  it('should pass the proper url string to `interceptors.request`', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch('url'),
      { wrapper }
    )
    await result.current.get()
    expect((fetch.mock.calls[0][1] as any).data).toEqual('url')
  })
})

describe('useFetch - BROWSER - Overwrite Global Options set in Provider', (): void => {
  const providerHeaders = {
    Authorization: 'Bearer TOKEN'
  }

  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => {
    const options = { headers: providerHeaders, cachePolicy: NO_CACHE }
    return <Provider url='https://example.com' options={options}>{children}</Provider>
  }

  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(JSON.stringify({}))
  })

  it('should only add Content-Type: application/json for POST and PUT by default', async (): Promise<void> => {
    const expectedHeadersGET = providerHeaders
    const expectedHeadersPOSTandPUT = {
      ...providerHeaders,
      'Content-Type': 'application/json'
    }
    const { result } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    await result.current.get()
    expect(fetch.mock.calls[0][0]).toBe('https://example.com')
    expect((fetch.mock.calls[0][1] as any).headers).toEqual(expectedHeadersGET)
    await result.current.post()
    expect((fetch.mock.calls[1][1] as any).headers).toEqual(expectedHeadersPOSTandPUT)
    await result.current.put()
    expect((fetch.mock.calls[2][1] as any).headers).toEqual(expectedHeadersPOSTandPUT)
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('should have the correct headers set in the options set in the Provider', async (): Promise<void> => {
    const expectedHeaders = providerHeaders
    const { result } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    await result.current.get()
    expect(fetch.mock.calls[0][0]).toBe('https://example.com')
    expect((fetch.mock.calls[0][1] as any).headers).toEqual(expectedHeaders)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should overwrite url and options set in the Provider', async (): Promise<void> => {
    const expectedHeaders = undefined
    const expectedURL = 'https://example2.com'
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch(expectedURL, globalOptions => {
        // TODO: fix the generics here so it knows when a header
        // such as Authorization is set
        delete (globalOptions.headers as any).Authorization
        return { ...globalOptions }
      }, []), // onMount === true
      { wrapper }
    )
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(fetch.mock.calls[0][0]).toBe(expectedURL)
    expect((fetch.mock.calls[0][1] as any).headers).toEqual(expectedHeaders)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should overwrite options set in the Provider', async (): Promise<void> => {
    const expectedHeaders = undefined
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch(globalOptions => {
        // TODO: fix the generics here so it knows when a header
        // such as Authorization is set
        delete (globalOptions.headers as any).Authorization
        return { ...globalOptions }
      }, []), // onMount === true
      { wrapper }
    )
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(fetch.mock.calls[0][0]).toBe('https://example.com')
    expect((fetch.mock.calls[0][1] as any).headers).toEqual(expectedHeaders)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('useFetch - BROWSER - suspense', (): void => {
  afterEach((): void => {
    fetch.resetMocks()
    cleanup()

    test.cleanup()
  })

  beforeEach((): void => {
    fetch.mockResponse(JSON.stringify('yay suspense'))
  })

  it('should render useFetch fallback', async () => {
    function Section() {
      const { data } = useFetch('https://a.co', { suspense: true }, [])
      return <div>{data}</div>
    }
    const { container } = test.render(
      <Suspense fallback={<div>fallback</div>}>
        <Section />
      </Suspense>
    )

    expect(container.textContent).toMatchInlineSnapshot('"fallback"')
    await test.act((): any => new Promise(resolve => setTimeout(resolve, 210)))
    expect(container.textContent).toMatchInlineSnapshot('"yay suspense"')
  })

  it('should render multiple useFetch fallbacks', async () => {
    function Section() {
      const { data: d1 } = useFetch('https://a.co/1', { suspense: true }, [])
      const { data: d2 } = useFetch('https://a.co/2', { suspense: true }, [])
      return <div>{d1} {d2}</div>
    }
    const { container } = test.render(
      <Suspense fallback={<div>fallback</div>}>
        <Section />
      </Suspense>
    )

    // TODO: I believe it should work with the commented out code below
    expect(container.textContent).toMatchInlineSnapshot('" fallback"')
    // await test.act((): any => new Promise(res => setTimeout(res, 10))) // still suspending
    // expect(container.textContent).toMatchInlineSnapshot(`"fallback"`)
    await test.act((): any => new Promise(resolve => setTimeout(resolve, 100))) // should recover
    expect(container.textContent).toMatchInlineSnapshot('"yay suspense yay suspense"')
  })

  it('should throw errors', async () => {
    function Section() {
      const { data } = useFetch('https://a.co', { suspense: true }, [])
      return <div>{data}</div>
    }
    // https://reactjs.org/docs/concurrent-mode-suspense.html#handling-errors
    const { container } = test.render(
      <ErrorBoundary fallback={<div>error boundary</div>}>
        <Suspense fallback={<div>fallback</div>}>
          <Section />
        </Suspense>
      </ErrorBoundary>
    )

    expect(container.textContent).toMatchInlineSnapshot('"fallback"')
    await test.act((): any => new Promise(resolve => setTimeout(resolve, 150))) // still suspending
    expect(container.textContent).toMatchInlineSnapshot('"yay suspense"')
  })
})

describe('useFetch - BROWSER - retryOn & retryDelay', (): void => {
  const expectedError = { name: 'TypeError', message: 'Failed to fetch' }
  // const expectedSuccess = { name: 'Alex Cory' }

  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  beforeEach((): void => {
    fetch.mockReject(expectedError)
  })

  it('should retryOn specific error codes', async (): Promise<void> => {
    expect(true).toBe(true)
  })

  it('should retryOn custom function', async (): Promise<void> => {
    expect(true).toBe(true)
  })

  it('should retry with a `retryDelay` as a positive number', async (): Promise<void> => {
    expect(true).toBe(true)
  })

  it('should retry with a `retryDelay` with an exponential backoff', async (): Promise<void> => {
    expect(true).toBe(true)
  })

  it('should error if `retryDelay` is not a function returning a positive number', async (): Promise<void> => {
    expect(true).toBe(true)
  })

  it('error if `retryOn` is not a function or an array of http status codes', async (): Promise<void> => {
    expect(true).toBe(true)
  })
})

describe('useFetch - BROWSER - errors', (): void => {
  const expectedError = { name: 'error', message: 'error' }
  const expectedSuccess = { name: 'Alex Cory' }

  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  beforeEach((): void => {
    fetch.mockRejectOnce(expectedError)
    fetch.mockResponseOnce(JSON.stringify(expectedSuccess))
  })

  it('should set the `error` object when response.ok is false', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockResponseOnce('fail', {
      status: 401
    })
    const { result } = renderHook(
      () => useFetch({
        url: 'https://example.com',
        data: [],
        cachePolicy: NO_CACHE
      })
    )
    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    await result.current.get()
    expect(result.current.error).toEqual({
      name: 401,
      message: 'Unauthorized'
    })
    expect(result.current.data).toEqual([])
  })

  it('should reset the error after each call', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockRejectOnce(expectedError)
    fetch.mockResponseOnce(JSON.stringify(expectedSuccess))
    const { result } = renderHook(
      () => useFetch('https://example.com/1', { cachePolicy: NO_CACHE, retries: 0 })
    )
    expect(result.current.loading).toBe(false)
    await result.current.get()
    expect(result.current.error).toEqual(expectedError)
    await result.current.get()
    expect(result.current.error).toBe(undefined)
    expect(result.current.data).toEqual(expectedSuccess)
  })

  it('should leave the default `data` as array if response is undefined or error', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockReject(expectedError)
    const { result } = renderHook(
      () => useFetch({
        url: 'https://example.com/2',
        data: [],
        cachePolicy: NO_CACHE
      })
    )
    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    await result.current.get()
    expect(result.current.error).toEqual(expectedError)
    expect(result.current.data).toEqual([])
  })

  const wrapperCustomError = ({ children }: { children?: ReactNode }): ReactElement => {
    const options = {
      interceptors: {
        async response(res: Res<any>): Promise<Res<any>> {
          if (!res.ok) throw expectedError
          return res
        }
      },
      cachePolicy: NO_CACHE
    }
    return (
      <Provider url='https://example.com' options={options}>{children}</Provider>
    )
  }

  it('should set the `error` properly for `interceptors.response`', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockReject(expectedError)
    const { result } = renderHook(
      () => useFetch(),
      { wrapper: wrapperCustomError }
    )
    await result.current.get()
    expect(result.current.response.ok).toBe(undefined)
    expect(JSON.stringify(result.current.response)).toEqual(JSON.stringify(emptyCustomResponse))
    expect(result.current.error).toEqual(expectedError)
  })

  it('should set the `error` properly for `interceptors.response` onMount', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockReject(expectedError)
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('https://example.com', []), // onMount === true
      { wrapper: wrapperCustomError }
    )
    await waitForNextUpdate()
    expect(result.current.response.ok).toBe(undefined)
    expect(result.current.error).toEqual(expectedError)
  })
})

describe('useFetch - BROWSER - persistence', (): void => {
  const expected = {
    name: 'Alex Cory',
    age: 29
  }
  const unexpected = {
    name: 'Mattias Rost',
    age: 37
  }

  afterAll((): void => {
    mockdate.reset()
  })

  beforeAll((): void => {
    mockdate.set('2020-01-01')
  })

  afterEach(() => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach((): void => {
    fetch.mockResponse(JSON.stringify(expected))
  })

  it('should fetch once', async (): Promise<void> => {
    const { waitForNextUpdate } = renderHook(
      () => useFetch({ url: 'https://persist.com', persist: true }, [])
    )

    await waitForNextUpdate()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should not fetch again', async (): Promise<void> => {
    fetch.mockResponse(JSON.stringify(unexpected))

    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ url: 'https://persist.com', persist: true }, [])
    )

    await waitForNextUpdate()

    expect(fetch).toHaveBeenCalledTimes(0)
    expect(result.current.data).toEqual(expected)
    expect(result.current.response.ok).toBe(true)
    expect(result.current.response.status).toEqual(200)
    expect(result.current.response).toHaveProperty('json')
    expect(result.current.response).toHaveProperty('text')
    expect(result.current.response).toHaveProperty('formData')
    expect(result.current.response).toHaveProperty('blob')
  })

  it('should fetch again after 24h', async (): Promise<void> => {
    mockdate.set('2020-01-02 02:00:00')

    const { waitForNextUpdate } = renderHook(
      () => useFetch({ url: 'https://persist.com', persist: true }, [])
    )

    await waitForNextUpdate()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should have `cache` in the return of useFetch', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch({ url: 'https://persist.com', persist: true }, [])
    )
    expect(result.current.cache).toBeDefined()
    expect(result.current.cache.get).toBeInstanceOf(Function)
    expect(result.current.cache.set).toBeInstanceOf(Function)
    expect(result.current.cache.has).toBeInstanceOf(Function)
    expect(result.current.cache.delete).toBeInstanceOf(Function)
    expect(result.current.cache.clear).toBeInstanceOf(Function)
  })

  it('should error if passing wrong cachePolicy with persist: true', async (): Promise<void> => {
    try {
      const { result } = renderHook(
        () => useFetch({ url: 'https://persist.com', persist: true, cachePolicy: NO_CACHE }, [])
      )
      expect(result.current.error).toBe(undefined)
    } catch (err) {
      expect(err.name).toBe('Invariant Violation')
      expect(err.message).toBe('You cannot use option \'persist\' with cachePolicy: no-cache 🙅‍♂️')
    }

    try {
      const { result } = renderHook(
        () => useFetch({ url: 'https://persist.com', persist: true, cachePolicy: NETWORK_ONLY }, [])
      )
      expect(result.current.error).toBe(undefined)
    } catch (err) {
      expect(err.name).toBe('Invariant Violation')
      expect(err.message).toBe('You cannot use option \'persist\' with cachePolicy: network-only 🙅‍♂️')
    }
  })
})
