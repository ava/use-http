import { makeConfig } from "../makeConfig";


describe.only('use-http configuration', () => {
  it('should create config from a single url argument', () => {
    const config = makeConfig({}, "http://blah.com")

    expect(config).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })
  });

  it('should create a config object from an options object', () => {
    const config = makeConfig({}, { url: "http://blah.com" })

    expect(config).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })
  })

  it('should set onMount true', () => {
    const config1 = makeConfig({}, "http://blah.com", { onMount: true })

    expect(config1).toEqual({ onMount: true, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })

    const config2 = makeConfig({}, { url: "http://blah.com", onMount: true })

    expect(config2).toEqual({ onMount: true, url: "http://blah.com", headers: { 'Content-Type': 'application/json' } })
  })

  it('should set headers', () => {
    const config1 = makeConfig({}, "http://blah.com", { headers: { 'Content-Type': 'multipart/form-data' } })

    expect(config1).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'multipart/form-data' } })

    const config2 = makeConfig({}, { url: "http://blah.com", onMount: false, headers: { 'Content-Type': 'multipart/form-data' } })

    expect(config2).toEqual({ onMount: false, url: "http://blah.com", headers: { 'Content-Type': 'multipart/form-data' } })
  });
});