import { renderHook } from '@testing-library/react-hooks'
import useFetchArgs, { useFetchArgsDefaults } from '../useFetchArgs'
import React, { ReactElement, ReactNode } from 'react'
import { Provider } from '..'

import { isServer } from '../utils'

describe('useFetchArgs: general usages', (): void => {
  if (isServer) return

  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
    <Provider url='https://example.com'>{children}</Provider>
  )

  it('should create custom options with `onMount: false` by default', (): void => {
    const { result } = renderHook((): any =>
      useFetchArgs('https://example.com')
    )
    expect(result.current).toEqual({
      ...useFetchArgsDefaults,
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
        url: 'https://example.com'
      }
    })
  })

  it('should create custom options with 1st arg as config object with `onMount: true`', (): void => {
    const { result } = renderHook((): any =>
      useFetchArgs({
        url: 'https://example.com'
      }, []) // onMount === true
    )
    expect(result.current).toEqual({
      ...useFetchArgsDefaults,
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
        url: 'https://example.com'
      },
      defaults: {
        loading: true,
        data: undefined
      },
      dependencies: [] // onMount === true
    })
  })

  it('should create custom options handling Provider/Context properly', (): void => {
    const { result } = renderHook((): any => useFetchArgs(), { wrapper })
    expect(result.current).toStrictEqual({
      ...useFetchArgsDefaults,
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
        url: 'https://example.com'
      }
    })
  })

  it('should overwrite `url` that is set in Provider/Context properly', (): void => {
    const { result } = renderHook(
      (): any => useFetchArgs('https://cool.com', []), // onMount === true
      { wrapper }
    )
    expect(result.current).toStrictEqual({
      ...useFetchArgsDefaults,
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
        url: 'https://cool.com'
      },
      defaults: {
        loading: true,
        data: undefined
      },
      dependencies: [] // onMount === true
    })
  })

  it('should set default data === []', (): void => {
    const { result } = renderHook(
      (): any => useFetchArgs({ data: [] }),
      { wrapper }
    )
    expect(result.current).toStrictEqual({
      ...useFetchArgsDefaults,
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
        url: 'https://example.com'
      },
      defaults: {
        loading: false,
        data: []
      }
    })
  })

  it('should have a default `url` if no URL is set in Provider', (): void => {
    if (isServer) return

    const wrapper2 = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider>{children}</Provider>
    )

    const { result } = renderHook((): any => useFetchArgs(), { wrapper: wrapper2 })

    const expected = {
      ...useFetchArgsDefaults,
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
        url: 'http://localhost'
      }
    }
    expect(result.current).toEqual(expected)
  })

  it('should correctly execute request + response interceptors with Provider', async(): Promise<void> => {
    const interceptors = {
      request(options: any) {
        options.headers.Authorization = 'Bearer test'
        return options
      },
      response(response: any) {
        response.test = 'test'
        return response
      }
    }

    const wrapper2 = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider url='https://example.com' options={{ interceptors }}>{children}</Provider>
    )

    const { result } = renderHook(
      (): any => useFetchArgs(),
      { wrapper: wrapper2 }
    )

    const { customOptions } = result.current
    const options = customOptions.interceptors.request({ headers: {} })
    expect(options.headers).toHaveProperty('Authorization')
    expect(options).toStrictEqual({
      headers: {
        Authorization: 'Bearer test'
      }
    })
    const response = customOptions.interceptors.response({})
    expect(response).toHaveProperty('test')
    expect(response).toEqual({ test: 'test' })
  })

  it('should correctly execute request + response interceptors', async(): Promise<void> => {
    const interceptors = {
      request(options: any) {
        options.headers.Authorization = 'Bearer test'
        return options
      },
      response(response: any) {
        response.test = 'test'
        return response
      }
    }

    const { result } = renderHook((): any => useFetchArgs('https://example.com', { interceptors }))

    const { customOptions } = result.current
    const options = customOptions.interceptors.request({ headers: {} })
    expect(options.headers).toHaveProperty('Authorization')
    expect(options).toStrictEqual({
      headers: {
        Authorization: 'Bearer test'
      }
    })
    const response = customOptions.interceptors.response({})
    expect(response).toHaveProperty('test')
    expect(response).toEqual({ test: 'test' })
  })

  it('should create custom options with `Content-Type: application/text`', (): void => {
    const options = { headers: { 'Content-Type': 'application/text' } }
    const { result } = renderHook((): any => useFetchArgs(options), { wrapper })
    expect(result.current).toStrictEqual({
      ...useFetchArgsDefaults,
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
        url: 'https://example.com'
      },
      requestInit: {
        ...options
      }
    })
  })

  it('should create custom options and use the global options instead of defaults', (): void => {
    const options = { headers: { 'Content-Type': 'application/text' } }
    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider options={options}>{children}</Provider>
    )
    const { result } = renderHook((): any => useFetchArgs(), { wrapper })
    expect(result.current).toStrictEqual({
      ...useFetchArgsDefaults,
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
        url: 'http://localhost'
      },
      requestInit: {
        ...options
      }
    })
  })

  it('should overwrite `Content-Type` that is set in Provider', (): void => {
    const options = {
      headers: {
        'Content-Type': 'application/text'
      }
    }
    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider options={options}>{children}</Provider>
    )
    const overwriteProviderOptions = {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=something'
      }
    }
    const { result } = renderHook(
      (): any => useFetchArgs(overwriteProviderOptions),
      { wrapper }
    )
    expect(result.current).toStrictEqual({
      ...useFetchArgsDefaults,
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
        url: 'http://localhost'
      },
      requestInit: {
        ...overwriteProviderOptions
      }
    })
  })
})

describe('useFetchArgs: Errors', (): void => {
  it('should error if no url string is set and no Provider is in place', (): void => {
    const { result } = renderHook((): any => useFetchArgs())
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe(
      'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>'
    )
  })

  it('should error if 1st arg is object and no URL field is set in it', (): void => {
    const { result } = renderHook((): any => useFetchArgs({}))
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe(
      'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>'
    )
  })

  it('should error if no URL is specified', (): void => {
    const { result } = renderHook((): any => useFetchArgs(''))
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe(
      'The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>'
    )
  })

  it('should error if 1st and 2nd arg are both objects', (): void => {
    const { result } = renderHook((): any => useFetchArgs({}, {}))
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe(
      'You cannot have a 2nd parameter of useFetch when your first argument is an object config.'
    )
  })

  it('should error if 1st and 2nd arg are both strings', (): void => {
    // const { result } = renderHook((): any => useCustomOptions('http://example.com', '?cool=sweet'))
    // expect(result.error.name).toBe('Invariant Violation')
    // expect(result.error.message).toBe('You cannot have a 2nd parameter of useFetch when your first argument is an object config.')
  })

  it('should error if 1st arg is object and 2nd arg is string', (): void => {
    // const { result } = renderHook((): any => useCustomOptions({}, '?cool=sweet'))
    // expect(result.error.name).toBe('Invariant Violation')
    // expect(result.error.message).toBe('You cannot have a 2nd parameter of useFetch when your first argument is an object config.')
  })
})
