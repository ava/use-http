import { makeConfig } from "../makeConfig";
import { renderHook } from '@testing-library/react-hooks';


describe.only('use-http configuration', () => {
  it('should create config from a single url argument', () => {
    const config = renderHook(() => makeConfig({}, "http://blah.com"))

    expect(config.result.current).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })
  });

  it('should create a config object from an options object', () => {
    const config = renderHook(() => makeConfig({}, { url: "http://blah.com" }))

    expect(config.result.current).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })
  })

  it('should set onMount true', () => {
    const config1 = renderHook(() => makeConfig({}, "http://blah.com", { onMount: true }))

    expect(config1.result.current).toEqual({ onMount: true, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })

    const config2 = renderHook(() => makeConfig({}, { url: "http://blah.com", onMount: true }))

    expect(config2.result.current).toEqual({ onMount: true, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })
  })

  it('should set headers', () => {
    const config1 = renderHook(() => makeConfig({}, "http://blah.com", { headers: { 'Content-Type': 'multipart/form-data' } }))

    expect(config1.result.current).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'multipart/form-data' } })

    const config2 = renderHook(() => makeConfig({}, { url: "http://blah.com", onMount: false, headers: { 'Content-Type': 'multipart/form-data' } }))

    expect(config2.result.current).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'multipart/form-data' } })
  });
});