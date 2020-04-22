/* eslint-disable no-var */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
import React, { ReactElement, ReactNode, useEffect } from 'react'
import { useFetch, Provider } from '..'
import { cleanup } from '@testing-library/react'
import * as test from '@testing-library/react'
import { FetchMock } from 'jest-fetch-mock'
import { toCamel } from 'convert-keys'
import { renderHook, act } from '@testing-library/react-hooks'
import mockConsole from 'jest-mock-console'
import * as mockdate from 'mockdate'
import defaults from '../defaults'

import { Res, IncomingOptions, CachePolicies } from '../types'
import { emptyCustomResponse, sleep, makeError, addSlash } from '../utils'

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

  it('should execute GET command with object destructuring', async (): Promise<void> => {
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

  it('should execute GET command with arrray destructuring', async (): Promise<void> => {
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

  it('should not be content-type: application/json by default if using FormData for request body', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch('url-1234567'),
      { wrapper: wrapper as React.ComponentType }
    )
    await act(async () => {
      var formData = new FormData()
      formData.append('username', 'AlexCory')
      await result.current.post(formData)
      const options = fetch.mock.calls[0][1] || { headers: {} }
      expect(options.method).toBe('POST')
      expect('Content-Type' in (options as any).headers).toBe(false)
    })
  })

  it('should not cause infinite loop with `[request]` as dependency', async () => {
    function Section() {
      const { request, data } = useFetch('https://a.co')
      useEffect(() => {
        request.get()
      }, [request])
      return <div>{JSON.stringify(data)}</div>
    }
    const { container } = test.render(<Section />)

    await test.act(async (): Promise<any> => await sleep(100))
    expect(JSON.parse(container.textContent as string)).toEqual(expected)
  })

  it('should not cause infinite loop with `[response]` as dependency', async () => {
    function Section() {
      const { request, response, data } = useFetch('https://a.co')
      useEffect(() => {
        (async () => {
          await request.get()
          if (!response.ok) console.error('no okay')
        })()
      }, [request, response])
      return <div>{JSON.stringify(data)}</div>
    }
    const { container } = test.render(<Section />)

    await test.act(async (): Promise<any> => await sleep(100))
    expect(JSON.parse(container.textContent as string)).toEqual(expected)
  })
})

describe('useFetch - handling host/path/route parsing properly', (): void => {
  it ('should have addSlash run properly', (): void => {
    expect(addSlash('', '')).toBe('')
    expect(addSlash('')).toBe('')
    expect(addSlash('?foo=bar', 'a.com')).toBe('?foo=bar')
    expect(addSlash('?foo=bar', 'a.com/')).toBe('?foo=bar')
    expect(addSlash('?foo=bar')).toBe('?foo=bar')
    expect(addSlash('/foo', 'a.com')).toBe('/foo')
    expect(addSlash('/foo', 'a.com/')).toBe('foo')
    expect(addSlash('foo', 'a.com')).toBe('/foo')
    expect(addSlash('foo', 'a.com/')).toBe('foo')
    expect(addSlash('foo')).toBe('/foo')
    expect(addSlash('/foo')).toBe('/foo')
  })
})

describe('useFetch - auto-managed state', (): void => {
  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  it('should not `skip` fetch execution when false', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockResponseOnce('Alex Cory')
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('/path', { skip: false }, []), // onMount === true
    )
    expect(result.current.data).toEqual(undefined)
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.data).toEqual('Alex Cory')
    expect(result.current.loading).toBe(false)
    expect(fetch.mock.calls.length).toBe(1)
  })
  
  it('should `skip` fetch execution when true', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch('/path', { skip: true }, []), // onMount === true
    )
    expect(result.current.data).toEqual(undefined)
    expect(result.current.loading).toBe(false)
    expect(fetch.mock.calls.length).toBe(0)
  })
})

describe('useFetch - responseType', (): void => {
  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  it('should fail to process a text response with responseType: `json`', async (): Promise<void> => {
    cleanup()
    fetch.resetMocks()
    fetch.mockResponseOnce('Alex Cory')
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('a-fake-url', { data: '', responseType: 'json' }, []), // onMount === true
    )
    expect(result.current.data).toEqual('')
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.error.name).toBe('FetchError')
  })

  it('should process .text() with default array responseType', async (): Promise<void> => {
    cleanup()
    fetch.resetMocks()
    const expectedString = 'Alex Cory'
    fetch.mockResponseOnce(JSON.stringify(expectedString))
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('a-fake-url', { data: '' }, []), // onMount === true
    )
    expect(result.current.data).toEqual('')
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBe(expectedString)
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

  it(`should work correctly: useFetch({ data: [] }, [])`, async (): Promise<void> => {
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

  it('should execute GET using Provider url', async (): Promise<void> => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ data: {} }, []), // onMount === true
      { wrapper }
    )

    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should execute GET using Provider url: request = useFetch(), request.get()', async (): Promise<void> => {
    const { result } = renderHook(() => useFetch(), { wrapper })
    expect(result.current.loading).toBe(false)
    await act(result.current.get)
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should execute GET using Provider url: request = useFetch(), request.get("/people")', async (): Promise<void> => {
    const { result } = renderHook(() => useFetch(), { wrapper })
    expect(result.current.loading).toBe(false)
    await act(async () => {
      await result.current.get('/people')
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should merge the data onNewData for pagination', async (): Promise<void> => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('/people', {
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

  it('should not make another request when there is no more data `perPage` pagination', async (): Promise<void> => {
    fetch.resetMocks()
    const expected1 = [1, 2, 3]
    fetch.mockResponseOnce(JSON.stringify(expected1))
      .mockResponseOnce(JSON.stringify([4]))
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ page }) => useFetch(`https://example.com?page=${page}`, {
        data: [],
        perPage: 3,
        onNewData: (currData, newData) => {
          return [...currData, ...newData]
        }
      }, [page]), // onMount === true
      {
        initialProps: { page: 1 },
        wrapper
      }
    )
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(expected1)
    act(() => rerender({ page: 2 }))
    await waitForNextUpdate()
    expect(result.current.data).toEqual([...expected1, 4])
    expect(fetch.mock.calls.length).toBe(2)
    act(() => rerender({ page: 3 }))
    expect(result.current.data).toEqual([...expected1, 4])
    expect(fetch.mock.calls.length).toBe(2)
  })

  it(`should execute GET using Provider url: useFetch('/people', [])`, async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('/people', []), // onMount === true
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

  it(`should execute GET and timeout after ${timeout}ms, and fire 'onTimeout' and 'onAbort'`, async (): Promise<void> => {
    const onAbort = jest.fn()
    const onTimeout = jest.fn()
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({
        timeout,
        onAbort,
        onTimeout
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

  it(`should execute GET, fail after ${timeout}ms, then retry 1 additional time`, async (): Promise<void> => {
    const onAbort = jest.fn()
    const onTimeout = jest.fn()
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('/todos', {
        retries: 1,
        // TODO: this test times out if `retryDelay > 0`
        // works in apps, not sure how to advance the timers correctly
        retryDelay: 0,
        timeout,
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
    await act(async () => {
      // make a 2nd request
      const responseData = await result.current.get()
      expect(responseData).toEqual(expected)
    })
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
    await act(async () => {
      const json = await result.current.get()
      const text = await response.text()
      expect(text).toBe(JSON.stringify(expected))
      expect(json).toEqual(expected)
    })
  })

  it('should still have a `response` promise even when being cached. `cache-first` cachePolicy (array destructuring)', async (): Promise<void> => {
    // run the request on mount
    const { result, waitForNextUpdate } = renderHook(() => useFetch('url-cache/array', []))
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    var [, response] = result.current
    expect(result.current.loading).toBe(false)
    await act(async () => {
      const json = await result.current.get()
      const text = await response.text()
      expect(text).toBe(JSON.stringify(expected))
      expect(json).toEqual(expected)
    })
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
    await act(async () => {
      // wait ~20ms to allow cache to expire
      await sleep(20)
      // make a 2nd request
      await result.current.get()
    })
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
    await act(async () => {
      const responseData = await result.current.post('/people', expected)
      expect(responseData).toEqual(expected)
    })
    expect(result.current.data).toEqual(expected)
    expect(result.current.loading).toBe(false)
  })

  it('should re-run the request when onUpdate dependencies are updated', async (): Promise<void> => {
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ initialValue }) => useFetch(`/${initialValue}`, {
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
      ({ initialValue }) => useFetch(`/a/${initialValue}`, {
        data: {}
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

  const request = jest.fn(({ options }) => options)
  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => {
    const options: IncomingOptions = {
      interceptors: {
        request,
        async response({ response: res }) {
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
    request.mockClear()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(JSON.stringify(snake_case))
  })

  it('should pass the proper response object for `interceptors.response`', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    await act(result.current.get)
    expect(result.current.response.ok).toBe(true)
    expect(result.current.response.data).toEqual(expected)
  })

  it('should have the `data` field correctly set when using a response interceptor', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    await act(result.current.get)
    expect(result.current.response.ok).toBe(true)
    expect(result.current.data).toEqual(expected)
  })

  it('should pass the proper path string to `interceptors.request`', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch('/path'),
      { wrapper }
    )
    await act(result.current.get)
    expect(fetch.mock.calls[0][0]).toBe('https://example.com/path')
    expect(request.mock.calls[0][0].path).toBe('/path')
  })

  it('should pass the proper route string to `interceptors.request`', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    await act(async () => {
      await result.current.get('/route')
    })
    expect(fetch.mock.calls[0][0]).toBe('https://example.com/route')
    expect(request.mock.calls[0][0].route).toBe('/route')
  })

  it('should pass the proper url string to `interceptors.request`', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    await act(result.current.get)
    expect(fetch.mock.calls[0][0]).toBe('https://example.com')
    expect(request.mock.calls[0][0].url).toBe('https://example.com')
  })
  
  it('should still call both interceptors when using cache', async (): Promise<void> => {
    let requestCalled = 0
    let responseCalled = 0
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('url', {
        interceptors: {
          async request({ options }) {
            requestCalled++
            return options
          },
          async response({ response }) {
            responseCalled++
            return response
          }
        }
      }, []),
    )
    await waitForNextUpdate()
    await act(result.current.get)
    expect(requestCalled).toBe(2)
    expect(responseCalled).toBe(2)
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
    fetch.mockResponse(JSON.stringify({}))
  })

  it('should only add Content-Type: application/json for POST and PUT by default', async (): Promise<void> => {
    const expectedHeadersGET = { ...defaults.headers, ...providerHeaders }
    const expectedHeadersPOSTandPUT = {
      ...defaults.headers,
      ...providerHeaders,
      'Content-Type': 'application/json'
    }
    const { result } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    await act(async () => {
      await result.current.get()
      expect(fetch.mock.calls[0][0]).toBe('https://example.com')
      expect((fetch.mock.calls[0][1] as any).headers).toEqual(expectedHeadersGET)
      await result.current.post()
      expect((fetch.mock.calls[1][1] as any).headers).toEqual(expectedHeadersPOSTandPUT)
      await result.current.put()
      expect((fetch.mock.calls[2][1] as any).headers).toEqual(expectedHeadersPOSTandPUT)
      expect(fetch).toHaveBeenCalledTimes(3)
    })
  })

  it('should have the correct headers set in the options set in the Provider', async (): Promise<void> => {
    const expectedHeaders = {
      ...defaults.headers,
      ...providerHeaders
    }
    const { result } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    await act(result.current.get)
    expect(fetch.mock.calls[0][0]).toBe('https://example.com')
    expect((fetch.mock.calls[0][1] as any).headers).toEqual(expectedHeaders)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should overwrite url and options set in the Provider', async (): Promise<void> => {
    const expectedHeaders = defaults.headers
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

  it('should overwrite options set in the Provider and not every instance of useFetch', async (): Promise<void> => {
    const expectedHeaders = defaults.headers
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
    const expectedHeadersGET = { ...defaults.headers, ...providerHeaders }
    const { waitForNextUpdate: wait2 } = renderHook(
      () => useFetch('/', []), // onMount === true
      { wrapper }
    )
    await wait2()
    expect((fetch.mock.calls[1][1] as any).headers).toEqual(expectedHeadersGET)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe('useFetch - BROWSER - suspense', (): void => {
  // TODO: these tests fail unpredictably. I think there might
  // be a race condition of some kind in `useFetch` that so
  // far has only shown up in tests
  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  const expected = 'yay suspense'
  beforeEach((): void => {
    fetch.mockResponse(JSON.stringify(expected))
  })

  // it('should render useFetch fallback', async () => {
  //   // TODO: something is wonky with `suspense` need to fix
  //   const { result, waitForNextUpdate } = renderHook(() => useFetch('https://a.co', { suspense: true }, []))
  //   await waitForNextUpdate()
  //   expect(result.current.data).toBe(expected)
  // })

  // it('should throw error', async () => {
  //   fetch.resetMocks()
  //   fetch.mockRejectOnce(makeError('Test', 'error'))
  //   const { result, waitForNextUpdate } = renderHook(() => useFetch('url-test-111', {
  //     suspense: true,
  //     retryDelay: 0,
  //     cachePolicy: NO_CACHE
  //   }, []))
  //   await waitForNextUpdate()
  //   expect(result.current.error.name).toBe('Test')
  //   expect(result.current.error.message).toBe('error')
  // })
})

describe('useFetch - BROWSER - retryOn & retryDelay', (): void => {
  describe('no network causing retry', () => {
    // `retryOn` as an array I don't *think* needs to be tested here
    const expectedError = makeError('TypeError', 'Failed to fetch')

    afterEach((): void => {
      fetch.resetMocks()
      cleanup()
    })

    beforeEach((): void => {
      fetch.mockReject(expectedError)
    })

    it('should retryOn custom function', async (): Promise<void> => {
      // should fail, then retry on error, fail again the retry 1 more time
      const { result, waitForNextUpdate } = renderHook(
        () => useFetch('url-2', {
          retries: 2,
          async retryOn({ error }) {
            return !!error
          }
        }, [])
      )
      await waitForNextUpdate()
      expect(result.current.error).toEqual(expectedError)
      expect(fetch.mock.calls.length).toBe(3)
    })

    it('should retry with a `retryDelay` as a positive number', async (): Promise<void> => {
      const { result, waitForNextUpdate } = renderHook(
        () => useFetch('url-5', {
          retries: 2,
          async retryOn({ error }) {
            return !!error
          },
          retryDelay: 100
        }, [])
      )
      await waitForNextUpdate()
      expect(result.current.error).toEqual(expectedError)
      expect(fetch.mock.calls.length).toBe(3)
    })

    it('should retry with a `retryDelay` as a function', async (): Promise<void> => {
      const { result, waitForNextUpdate } = renderHook(
        () => useFetch('url-7', {
          retries: 2,
          async retryOn({ error }) {
            return !!error
          },
          retryDelay() {
            return 100
          }
        }, [])
      )
      await waitForNextUpdate()
      expect(result.current.error).toEqual(expectedError)
      expect(fetch.mock.calls.length).toBe(3)
    })
  })

  // still `retryDelay` and `retryOn`
  describe('has network but fails by something like a status code > 299', () => {
    const expectedSuccess = { no: 'way' }
    afterEach((): void => {
      fetch.resetMocks()
      cleanup()
    })

    beforeEach((): void => {
      fetch.resetMocks()
      fetch.mockResponseOnce('fail', { status: 401 })
        .mockResponseOnce('fail', { status: 400 })
        .mockResponseOnce(JSON.stringify(expectedSuccess))
    })

    it('should retryOn specific error codes', async (): Promise<void> => {
      const { result, waitForNextUpdate } = renderHook(
        () => useFetch('some-url-1234124', {
          retries: 2,
          retryOn: [401]
        }, [])
      )
      await waitForNextUpdate()
      expect(result.current.error).toEqual(makeError(400, 'Bad Request'))
      expect(fetch.mock.calls.length).toBe(2)
    })

    it('should retryOn custom function', async (): Promise<void> => {
      // should fail, then retry on 401, fail again, but not retry on 400
      const { result, waitForNextUpdate } = renderHook(
        () => useFetch('url-2', {
          retries: 2,
          async retryOn({ response }) {
            return !!(response && response.status === 401)
          }
        }, [])
      )
      await waitForNextUpdate()
      expect(result.current.error).toEqual(makeError(400, 'Bad Request'))
      expect(fetch.mock.calls.length).toBe(2)
    })

    it('should retry 3 times, fail all 3, then retry 3 more times when called again', async (): Promise<void> => {
      fetch.resetMocks()
      fetch.mockResponse('fail', { status: 400 })
      const { result, waitForNextUpdate } = renderHook(
        () => useFetch('url-12', {
          retries: 2,
          async retryOn({ response }) {
            return !!(response && response.status === 400)
          },
          cachePolicy: CachePolicies.NO_CACHE
        }, [])
      )
      await waitForNextUpdate()
      expect(result.current.error).toEqual(makeError(400, 'Bad Request'))
      expect(fetch.mock.calls.length).toBe(3)
      await act(result.current.get)
      expect(result.current.error).toEqual(makeError(400, 'Bad Request'))
      expect(fetch.mock.calls.length).toBe(6)
    })

    it('should retry with a `retryDelay` as a positive number', async (): Promise<void> => {
      const { result, waitForNextUpdate } = renderHook(
        () => useFetch('url-5', {
          retries: 2,
          retryOn: [401, 400],
          retryDelay: 100
        }, [])
      )
      await waitForNextUpdate()
      expect(result.current.error).toEqual(undefined)
      expect(result.current.data).toEqual(expectedSuccess)
      expect(fetch.mock.calls.length).toBe(3)
    })

    it('should retry with a `retryDelay` as a function', async (): Promise<void> => {
      const { result, waitForNextUpdate } = renderHook(
        () => useFetch('url-7', {
          retries: 2,
          retryOn: [401, 400],
          retryDelay() {
            return 100
          }
        }, [])
      )
      await waitForNextUpdate()
      expect(result.current.error).toEqual(undefined)
      expect(result.current.data).toEqual(expectedSuccess)
      expect(fetch.mock.calls.length).toBe(3)
    })

    it('should error with a `retryDelay` that is not a postive # or a function returning a positive #', async (): Promise<void> => {
      fetch.resetMocks()
      fetch.mockResponse('fail', { status: 400 })
      const { result } = renderHook(() => useFetch('some-url-122', { retryDelay: -1000, retryOn: [400], retries: 2 }, []))
      expect(result.error.name).toBe('Invariant Violation')

      // TODO: there is an issue with error testing some things
      // see more detail here: https://github.com/testing-library/react-hooks-testing-library/issues/308
      // we basically want to test if when we call the `retry` function, if the `delay` is >= 0
      // Not catching invariant from the `retry` function
      // let caughtError = null
      // class ErrorBoundary extends React.Component {
      //   state = { hasError: false }
      //   componentDidCatch(error: any) {
      //     console.log('RUN')
      //     this.setState({ hasError: true })
      //     // console.log('error', error)
      //     caughtError = error
      //   }
      //   render = () => !this.state.hasError && this.props.children
      // }
      // const wrapper = ({ children }: { children?: ReactNode }): ReactElement => <ErrorBoundary>{children}</ErrorBoundary>
      // const { result } = renderHook(() => useFetch('Z', { retryDelay: -1000 }, []), { wrapper })
      const restoreConsole = mockConsole('error')
      const { waitForNextUpdate } = renderHook(() => useFetch('some-url-12', {
        retries: 2,
        retryOn: [400],
        retryDelay() {
          return -1000
        }
      }, []))
      await waitForNextUpdate()
      expect(console.error).toHaveBeenCalledTimes(2)
      restoreConsole()
    })

    it('should error if `retryOn` is not a function or an array of positive numbers', async (): Promise<void> => {
      // TODO: should we check to see if they are valid http status codes?
      // - regex: /^[1-5][0-9][0-9]$/
      // - ts HttpStatusCodes enum: https://gist.github.com/RWOverdijk/6cef816cfdf5722228e01cc05fd4b094
      var { result } = renderHook(() => useFetch('url-11211', { retryOn: 1000 as any, retries: 2 }, []))
      expect(result.error.name).toBe('Invariant Violation')
      // eslint-disable-next-line
      var { result } = renderHook(() => useFetch('url-111211', { retryOn: ['c'] as any, retries: 2 }, []))
      expect(result.error.name).toBe('Invariant Violation')
    })
  })
})

describe('useFetch - BROWSER - errors', (): void => {
  const expectedError = makeError('error', 'error')
  const expectedSuccess = { name: 'Alex Cory' }

  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  beforeEach((): void => {
    fetch.mockRejectOnce(expectedError)
    fetch.mockResponseOnce(JSON.stringify(expectedSuccess))
  })

  it('should call onError when there is a network error', async (): Promise<void> => {
    const onError = jest.fn()
    const { waitForNextUpdate } = renderHook(
      () => useFetch('https://example.com', { onError }, [])
    )
    await waitForNextUpdate()
    expect(onError).toBeCalled()
    expect(onError).toHaveBeenCalledWith({ error: expectedError })
  })
  
  it('should not call onError when aborting a request', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockResponse('fail', { status: 401 })
    const onError = jest.fn()
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('https://example.com', { onError }, [])
    )
    act(result.current.abort)
    await waitForNextUpdate()
    expect(onError).not.toBeCalled()
  })
  
  it('should only call onError on the last retry', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockResponse('fail', { status: 401 })
    const onError = jest.fn()
    const { waitForNextUpdate } = renderHook(
      () => useFetch('https://example.com/4', { onError, retries: 1 }, [])
    )
    await waitForNextUpdate()
    expect(onError).toBeCalledTimes(1)
    expect(onError).toHaveBeenCalledWith({ error: makeError(401, 'Unauthorized') })
  })
  
  it('should call onError when !response.ok', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockResponse('fail', { status: 401 })
    const onError = jest.fn()
    const { waitForNextUpdate } = renderHook(
      () => useFetch('https://example.com', { onError }, [])
    )
    await waitForNextUpdate()
    expect(onError).toBeCalled()
    expect(onError).toHaveBeenCalledWith({ error: makeError(401, 'Unauthorized') })
  })
  
  it('should set the `error` object when response.ok is false', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockResponse('fail', { status: 401 })
    const { result } = renderHook(
      () => useFetch('https://example.com', {
        data: [],
        cachePolicy: NO_CACHE
      })
    )
    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    await act(result.current.get)
    expect(result.current.error).toEqual(makeError(401, 'Unauthorized'))
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
    await act(async () => {
      await result.current.get()
      expect(result.current.error).toEqual(expectedError)
      await result.current.get()
      expect(result.current.error).toBe(undefined)
      expect(result.current.data).toEqual(expectedSuccess)
    })
  })

  it('should leave the default `data` as array if response is undefined or error', async (): Promise<void> => {
    fetch.resetMocks()
    fetch.mockReject(expectedError)
    const { result } = renderHook(
      () => useFetch('https://example.com/2', {
        data: [],
        cachePolicy: NO_CACHE
      })
    )
    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    await act(result.current.get)
    expect(result.current.error).toEqual(expectedError)
    expect(result.current.data).toEqual([])
  })

  const wrapperCustomError = ({ children }: { children?: ReactNode }): ReactElement => {
    const options = {
      interceptors: {
        async response<TData = any>({ response }: { response: Res<TData> }): Promise<Res<TData>> {
          if (!response.ok) throw expectedError
          return response
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
    await act(result.current.get)
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
      () => useFetch('https://persist.com', { persist: true }, [])
    )
    await waitForNextUpdate()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should not fetch again', async (): Promise<void> => {
    fetch.mockResponse(JSON.stringify(unexpected))

    const { result, waitForNextUpdate } = renderHook(
      () => useFetch('https://persist.com', { persist: true }, [])
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
      () => useFetch('https://persist.com', { persist: true }, [])
    )
    await waitForNextUpdate()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should have `cache` in the return of useFetch', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch('https://persist.com', { persist: true })
    )
    expect(result.current.cache).toBeDefined()
    expect(result.current.cache.get).toBeInstanceOf(Function)
    expect(result.current.cache.set).toBeInstanceOf(Function)
    expect(result.current.cache.has).toBeInstanceOf(Function)
    expect(result.current.cache.delete).toBeInstanceOf(Function)
    expect(result.current.cache.clear).toBeInstanceOf(Function)
  })

  it('should error if passing wrong cachePolicy with persist: true', async (): Promise<void> => {
    var { result } = renderHook(
      () => useFetch('https://persist.com', { persist: true, cachePolicy: NO_CACHE }, [])
    )
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe('You cannot use option \'persist\' with cachePolicy: no-cache 🙅‍♂️')

    // eslint-disable-next-line
    var { result } = renderHook(
      () => useFetch('https://persist.com', { persist: true, cachePolicy: NETWORK_ONLY }, [])
    )
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe('You cannot use option \'persist\' with cachePolicy: network-only 🙅‍♂️')
  })
})
