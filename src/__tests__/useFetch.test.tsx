import React, { ReactElement, ReactNode, useState } from 'react'
import { useFetch, Provider } from '..'
import { cleanup } from '@testing-library/react'
import { FetchMock } from 'jest-fetch-mock'

const fetch = global.fetch as FetchMock

import { renderHook } from '@testing-library/react-hooks'

// Provider Tests =================================================
/**
 * Test Cases
 * Provider:
 * 1. URL only
 * 2. Options only
 * 3. graphql only
 * 4. URL and Options only
 * 5. URL and graphql only
 * 6. Options and graphql only
 * 7. URL and graphql and Options
 * useFetch:
 * A. const [data, loading, error, request] = useFetch()
 * B. const {data, loading, error, request} = useFetch()
 * C. const [data, loading, error, request] = useFetch('http://url.com')
 * D. const [data, loading, error, request] = useFetch('http://url.com', { onMount: true })
 * E. const [data, loading, error, request] = useFetch({ onMount: true })
 * F. const [data, loading, error, request] = useFetch({ url: 'http://url.com' })
 * G. const [data, loading, error, request] = useFetch(oldOptions => ({ ...newOptions }))
 * H. const [data, loading, error, request] = useFetch('http://url.com', oldOptions => ({ ...newOptions }))
 * Errors:
 * SSR Tests:
 */


describe('useFetch - BROWSER - basic functionality', (): void => {
  const expected = {
    name: 'Alex Cory',
    age: 29,
  }

  const wrapper = ({ children }: { children: ReactElement }) => <Provider url="https://example.com">{children}</Provider>

  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(
      JSON.stringify(expected),
    )
  })

  it('should execute GET command with object destructuring', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ onMount: true }),
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
      () => useFetch({ onMount: true }),
      { wrapper: wrapper as React.ComponentType }
    )

    var [request, response, loading, error] = result.current
    expect(request.loading).toBe(true)
    expect(loading).toBe(true)
    expect(error).toBe(undefined)
    await waitForNextUpdate()
    var [request, response, loading, error] = result.current
    expect(response.data).toEqual(expected)
    expect(request.loading).toBe(false)
    expect(loading).toBe(false)
  })
})

describe('useFetch - BROWSER - with <Provider />', (): void => {
  const expected = {
    name: 'Alex Cory',
    age: 29,
  }

  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
    <Provider url='https://example.com'>{children as ReactElement}</Provider>
  )

  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(
      JSON.stringify(expected),
    )
  })

  it('should work correctly: useFetch({ onMount: true, data: [] })', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ onMount: true, data: {} }),
      { wrapper: wrapper as React.ComponentType }
    )

    expect(result.current.data).toEqual({})
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should execute GET using Provider url: useFetch({ onMount: true })', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ onMount: true }),
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
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    expect(result.current.loading).toBe(false)
    result.current.get()
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should execute GET using Provider url: request = useFetch(), request.get("/people")', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch(),
      { wrapper }
    )
    expect(result.current.loading).toBe(false)
    result.current.get('/people')
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should execute GET using Provider url: useFetch({ path: "/people", onMount: true })', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ path: '/people', onMount: true }),
      { wrapper }
    )
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
    // TODO: test if you do a post('/alex'), if the url is /people/alex
  })
})

describe('useFetch - BROWSER - with <Provider /> - Managed State', (): void => {
  const expected = { title: 'Alex Cory' }

  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
    <Provider url='https://example.com'>{children as ReactElement}</Provider>
  )

  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(
      JSON.stringify(expected),
    )
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
    // const [x, setX] = useState(1)
    // const { result } = renderHook(
    //   () => useFetch({
    //     onUpdate: [x],
    //     data: {}
    //   }),
    //   { wrapper }
    // )
    // expect(result.current.data).toEqual({})
    // setX(2)
    // expect(result.current.data).toEqual(expected)
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

  it('should reset the error after each call', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch('https://example.com'),
    )
    expect(result.current.loading).toBe(false)
    await result.current.get()
    expect(result.current.error).toEqual(expectedError)
    await result.current.get()
    expect(result.current.error).toBe(undefined)
    expect(result.current.data).toEqual(expectedSuccess)
  })

  it('should leave the default `data` as array if response is undefined or error', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch({
        url: 'https://example.com',
        data: []
      }),
    )
    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    await result.current.get()
    expect(result.current.error).toEqual(expectedError)
    expect(result.current.data).toEqual([])
  })
})