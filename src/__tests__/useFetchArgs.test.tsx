import { renderHook } from '@testing-library/react-hooks'
import useFetchArgs from '../useFetchArgs'
import defaults, { useFetchArgsDefaults } from '../defaults'
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
      host: 'https://example.com',
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
      }
    })
  })

  it('should create custom options with 1st arg as config object with `onMount: true`', (): void => {
    const { result } = renderHook((): any =>
      useFetchArgs('https://example.com', []) // onMount === true
    )
    expect(result.current).toEqual({
      ...useFetchArgsDefaults,
      host: 'https://example.com',
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
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
      host: 'https://example.com',
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
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
      host: 'https://cool.com',
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
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
      host: 'https://example.com',
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
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
      host: 'http://localhost',
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
      }
    }
    expect(result.current).toEqual(expected)
  })

  it('should correctly execute request + response interceptors with Provider', async (): Promise<void> => {
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

  it('should correctly execute request + response interceptors', async (): Promise<void> => {
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
      host: 'https://example.com',
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
      },
      requestInit: {
        ...options,
        headers: {
          ...defaults.headers,
          ...options.headers
        }
      }
    })
  })

  it('should create custom options and use the global options instead of defaults', (): void => {
    const options = { headers: { 'Content-Type': 'application/text' } }
    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider options={options}>{children}</Provider>
    )
    const { result } = renderHook((): any => useFetchArgs('http://localhost'), { wrapper })
    expect(result.current).toStrictEqual({
      ...useFetchArgsDefaults,
      host: 'http://localhost',
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
      },
      requestInit: {
        headers: {
          ...defaults.headers,
          ...options.headers
        }
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
      host: 'http://localhost',
      customOptions: {
        ...useFetchArgsDefaults.customOptions,
      },
      requestInit: {
        ...overwriteProviderOptions,
        headers: {
          ...defaults.headers,
          ...overwriteProviderOptions.headers
        }
      }
    })
  })
})

describe('useFetchArgs: Errors', (): void => {
  it('should error if 1st and 2nd arg are both objects', (): void => {
    const { result } = renderHook((): any => useFetchArgs({}, {}))
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe(
      'You cannot have a 2nd parameter of useFetch as object when your first argument is an object.'
    )
  })

  // TODO
  it('should error if 1st and 2nd arg are both strings', (): void => {
    expect(typeof useFetchArgs).toBe('function')
    // const { result } = renderHook((): any => useFetchArgs('http://example.com', '?cool=sweet'))
    // expect(result.error.name).toBe('Invariant Violation')
    // expect(result.error.message).toBe('You cannot have a 2nd parameter of useFetch when your first argument is an object config.')
  })

  // TODO
  it('should error if 1st arg is object and 2nd arg is string', (): void => {
    expect(typeof useFetchArgs).toBe('function')
    // const { result } = renderHook((): any => useFetchArgs({}, '?cool=sweet'))
    // expect(result.error.name).toBe('Invariant Violation')
    // expect(result.error.message).toBe('You cannot have a 2nd parameter of useFetch when your first argument is an object config.')
  })
})
