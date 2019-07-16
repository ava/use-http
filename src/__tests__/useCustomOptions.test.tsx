// import React, { ReactElement, FunctionComponent, PropsWithChildren } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import useCustomOptions from '../useCustomOptions'
// import { Provider } from '..'

describe('use-http useCustomOptions', () => {
  // should ERROR
  // useCustomOptions('https://example.com', 'https://example.com') // 1st + 2nd arg string
  // it('should not allow 1st + 2nd arg to be a string', () => {
  //   let result
  //   try {
  //     let res = renderHook(() => useCustomOptions('https://example.com', 'https://example.com'))
  //     result = res.result
  //   } catch(err) {
  //     console.log('ERR: ', err)
  //   }
  //   console.log('RES: ', result)
  // })
  // useCustomOptions({}, 'https://example.com') // 2nd arg is string
  // useCustomOptions() // no url string is set and no Provider
  // useCustomOptions({}, {}) // both should not be objects
  // useCustomOptions({}) // no url is set in request init object

  // should PASS
  it('should create custom options', () => {
    var { result } = renderHook(() => useCustomOptions(''))
    expect(result.current).toEqual({ url: '', onMount: false })
    var { result } = renderHook(() => useCustomOptions('http://example.com'))
    expect(result.current).toEqual({ url: 'http://example.com', onMount: false })
    var { result } = renderHook(() => useCustomOptions({
      url: 'http://example.com',
      onMount: true
    }))
    expect(result.current).toEqual({ url: 'http://example.com', onMount: true })
  })

  it('should create custom options handling Provider/Context properly', () => {
    // see: https://react-hooks-testing-library.com/usage/advanced-hooks
    // const wrapper: FunctionComponent<PropsWithChildren> = ({ children }): ReactElement => (
    //   <Provider url='https://example.com'>{children}</Provider>
    // ) as 
    // var { result } = renderHook(() => useCustomOptions(), { wrapper })
  })
  // it('should create config from a single url argument', () => {
  //   const config = makeConfig({}, "http://blah.com")

  //   expect(config).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })
  // });

  // it('should create a config object from an options object', () => {
  //   const config = makeConfig({}, { url: "http://blah.com" })

  //   expect(config).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })
  // })

  // it('should set onMount true', () => {
  //   const config1 = makeConfig({}, "http://blah.com", { onMount: true })

  //   expect(config1).toEqual({ onMount: true, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })

  //   const config2 = makeConfig({}, { url: "http://blah.com", onMount: true })

  //   expect(config2).toEqual({ onMount: true, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })
  // })

  // it('should set headers', () => {
  //   const config1 = makeConfig({}, "http://blah.com", { headers: { 'Content-Type': 'multipart/form-data' } })

  //   expect(config1).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'multipart/form-data' } })

  //   const config2 = makeConfig({}, { url: "http://blah.com", onMount: false, headers: { 'Content-Type': 'multipart/form-data' } })

  //   expect(config2).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'multipart/form-data' } })
  // });
});