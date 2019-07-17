/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react-hooks'
import useCustomOptions from '../useCustomOptions'
import { ReactElement, ReactNode } from 'react'
import { Provider } from '..'
import React from 'react'
import { isServer } from '../utils';

describe('useCustomOptions: general usages', (): void => {
  it('should create custom options with `onMount: false` by default', (): void => {
    var { result } = renderHook((): any => useCustomOptions('http://example.com'))
    expect(result.current).toEqual({ url: 'http://example.com', onMount: false })
  })

  it('should create custom options with 1st arg as config object with `onMount: true`', (): void => {
    var { result } = renderHook((): any => useCustomOptions({
      url: 'http://example.com',
      onMount: true
    }))
    expect(result.current).toEqual({ url: 'http://example.com', onMount: true })
  })

  it('should create custom options handling Provider/Context properly', (): void => {
    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider url='https://example.com'>{children as ReactElement}</Provider>
    )
    const { result } = renderHook((): any => useCustomOptions(), { wrapper })
    expect(result.current).toStrictEqual({ url: 'https://example.com', onMount: false })
  })

  it('should overwrite `url` that is set in Provider/Context properly', (): void => {
    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider url='https://example.com'>{children as ReactElement}</Provider>
    )
    const { result } = renderHook((): any => useCustomOptions('https://cool.com', { onMount: true }), { wrapper })
    expect(result.current).toStrictEqual({ url: 'https://cool.com', onMount: true })
  })

  it('should have a default `url` if no URL is set in Provider', (): void => {
    if (isServer) return

    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider>{children as ReactElement}</Provider>
    )
    const { result } = renderHook((): any => useCustomOptions(), { wrapper })
    expect(result.current).toStrictEqual({ url: 'http://localhost', onMount: false })
  })
})

describe('useCustomOptions: Errors', (): void => {
  it('should error if no url string is set and no Provider is in place', (): void => {
    const { result } = renderHook((): any => useCustomOptions())
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe('The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')
  })

  it('should error if 1st arg is object and no URL field is set in it', (): void => {
    const { result } = renderHook((): any => useCustomOptions({}))
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe('The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')
  })

  it('should error if no URL is specified', (): void => {
    const { result } = renderHook((): any => useCustomOptions(''))
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe('The first argument of useFetch is required unless you have a global url setup like: <Provider url="https://example.com"></Provider>')
  })

  it('should error if 1st and 2nd arg are both objects', (): void => {
    const { result } = renderHook((): any => useCustomOptions({}, {}))
    expect(result.error.name).toBe('Invariant Violation')
    expect(result.error.message).toBe('You cannot have a 2nd parameter of useFetch when your first argument is an object config.')
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
});