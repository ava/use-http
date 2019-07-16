// import React, { ReactElement, FunctionComponent, PropsWithChildren } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import useCustomOptions from '../useCustomOptions'
import { ReactElement, ReactNode } from 'react'
import { Provider } from '..'
import React from 'react'

describe('useCustomOptions: general usages', (): void => {
  it('should create custom options with `onMount: false` by default', (): void => {
    var { result } = renderHook(() => useCustomOptions('http://example.com'))
    expect(result.current).toEqual({ url: 'http://example.com', onMount: false })
  })

  it('should create custom options with 1st arg as config object with `onMount: true`', (): void => {
    var { result } = renderHook(() => useCustomOptions({
      url: 'http://example.com',
      onMount: true
    }))
    expect(result.current).toEqual({ url: 'http://example.com', onMount: true })
  })

  it('should create custom options handling Provider/Context properly', (): void => {
    // see: https://react-hooks-testing-library.com/usage/advanced-hooks
    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider url='https://example.com'>{children as ReactElement}</Provider>
    )
    const { result } = renderHook(() => useCustomOptions(), { wrapper })
    expect(result.current).toStrictEqual({ url: 'https://example.com', onMount: false })
  })

  it('should overwrite `url` that is set in Provider/Context properly', (): void => {
    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider url='https://example.com'>{children as ReactElement}</Provider>
    )
    const { result } = renderHook(() => useCustomOptions('https://cool.com', { onMount: true }), { wrapper })
    expect(result.current).toStrictEqual({ url: 'https://cool.com', onMount: true })
  })
})

describe('useCustomOptions: Errors', (): void => {
  it('should error if no url string is set and no Provider is in place', (): void => {
    const { result } = renderHook(() => useCustomOptions())
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe('The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')
  })

  it('should error if 1st arg is object and no URL field is set in it', (): void => {
    const { result } = renderHook(() => useCustomOptions({}))
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe('The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')
  })

  it('should error if no URL is specified', (): void => {
    const { result } = renderHook(() => useCustomOptions(''))
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe('The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')
  })

  it('should error if 1st and 2nd arg are both objects', (): void => {
    const { result } = renderHook(() => useCustomOptions({}, {}))
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe('You cannot have a 2nd parameter of useFetch when your first argument is an object config.')
  })

  it('should error if 1st and 2nd arg are both strings', (): void => {
    // const { result } = renderHook(() => useCustomOptions('http://example.com', '?cool=sweet'))
    // expect(result.error.name).toBe('Invariant Violation')
    // expect(result.error.message).toBe('You cannot have a 2nd parameter of useFetch when your first argument is an object config.')
  })

  it('should error if 1st arg is object and 2nd arg is string', (): void => {
    // const { result } = renderHook(() => useCustomOptions({}, '?cool=sweet'))
    // expect(result.error.name).toBe('Invariant Violation')
    // expect(result.error.message).toBe('You cannot have a 2nd parameter of useFetch when your first argument is an object config.')
  })
});