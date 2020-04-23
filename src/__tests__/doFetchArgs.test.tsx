import doFetchArgs from '../doFetchArgs'
import { HTTPMethod } from '../types'
import defaults from '../defaults'
import useCache from '../useCache'

describe('doFetchArgs: general usages', (): void => {
  it('should be defined', (): void => {
    expect(doFetchArgs).toBeDefined()
  })

  it('should form the correct URL', async (): Promise<void> => {
    const controller = new AbortController()
    const expectedRoute = '/test'
    const cache = useCache({
      persist: false,
      cacheLife: defaults.cacheLife,
      cachePolicy: defaults.cachePolicy
    })
    const { url, options } = await doFetchArgs(
      {},
      HTTPMethod.POST,
      controller,
      defaults.cacheLife,
      cache,
      '',
      '',
      expectedRoute,
      {}
    )
    expect(url).toBe(expectedRoute)
    expect(options).toStrictEqual({
      body: '{}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      signal: controller.signal
    })
  })

  it('should accept an array for the body of a request', async (): Promise<void> => {
    const controller = new AbortController()
    const cache = useCache({
      persist: false,
      cacheLife: defaults.cacheLife,
      cachePolicy: defaults.cachePolicy
    })
    const { options, url } = await doFetchArgs(
      {},
      HTTPMethod.POST,
      controller,
      defaults.cacheLife,
      cache,
      'https://example.com',
      '',
      '/test',
      []
    )
    expect(url).toBe('https://example.com/test')
    expect(options).toStrictEqual({
      body: '[]',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      signal: controller.signal
    })
  })

  it('should correctly add `path` and `route` to the URL', async (): Promise<void> => {
    const controller = new AbortController()
    const cache = useCache({
      persist: false,
      cacheLife: defaults.cacheLife,
      cachePolicy: defaults.cachePolicy
    })
    const { url } = await doFetchArgs(
      {},
      HTTPMethod.POST,
      controller,
      defaults.cacheLife,
      cache,
      'https://example.com',
      '/path',
      '/route',
      {}
    )
    expect(url).toBe('https://example.com/path/route')
  })

  it('should correctly modify the options with the request interceptor', async (): Promise<void> => {
    const controller = new AbortController()
    const cache = useCache({
      persist: false,
      cacheLife: defaults.cacheLife,
      cachePolicy: defaults.cachePolicy
    })
    const interceptors = {
      async request({ options }: { options: any }) {
        options.headers.Authorization = 'Bearer test'
        return options
      }
    }
    const { options } = await doFetchArgs(
      {},
      HTTPMethod.POST,
      controller,
      defaults.cacheLife,
      cache,
      undefined,
      '',
      '/test',
      {},
      interceptors.request
    )
    expect(options.headers).toHaveProperty('Authorization')
    expect(options).toStrictEqual({
      body: '{}',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test'
      },
      method: 'POST',
      signal: controller.signal
    })
  })
})

describe('doFetchArgs: Errors', (): void => {
  it('should error if 1st and 2nd arg of doFetch are both objects', async (): Promise<void> => {
    const controller = new AbortController()
    const cache = useCache({
      persist: false,
      cacheLife: defaults.cacheLife,
      cachePolicy: defaults.cachePolicy
    })
    // AKA, the last 2 arguments of doFetchArgs are both objects
    // try {
    //   await doFetchArgs(
    //     {},
    //     '',
    //     '',
    //     HTTPMethod.GET,
    //     controller,
    //     defaultCachePolicy,
    //     cache,
    //     {},
    //     {}
    //   )
    // } catch (err) {
    //   expect(err.name).toBe('Invariant Violation')
    //   expect(err.message).toBe('If first argument of get() is an object, you cannot have a 2nd argument. 😜')
    // }
    await expect(
      doFetchArgs(
        {},
        HTTPMethod.GET,
        controller,
        defaults.cacheLife,
        cache,
        '',
        '',
        {},
        {}
      )
    ).rejects.toMatchObject({
      name: 'Invariant Violation',
      message: 'If first argument of get() is an object, you cannot have a 2nd argument. 😜'
    })
  })

  it('should error if 1st and 2nd arg of doFetch are both arrays', async (): Promise<void> => {
    const controller = new AbortController()
    const cache = useCache({
      persist: false,
      cacheLife: defaults.cacheLife,
      cachePolicy: defaults.cachePolicy
    })
    // AKA, the last 2 arguments of doFetchArgs are both arrays
    // try {
    //   await doFetchArgs(
    //     {},
    //     '',
    //     '',
    //     HTTPMethod.GET,
    //     controller,
    //     defaultCachePolicy,
    //     cache,
    //     [],
    //     []
    //   )
    // } catch (err) {
    //   expect(err.name).toBe('Invariant Violation')
    //   expect(err.message).toBe('If first argument of get() is an object, you cannot have a 2nd argument. 😜')
    // }
    await expect(
      doFetchArgs(
        {},
        HTTPMethod.GET,
        controller,
        defaults.cacheLife,
        cache,
        '',
        '',
        [],
        []
      )
    ).rejects.toMatchObject({
      name: 'Invariant Violation',
      message: 'If first argument of get() is an object, you cannot have a 2nd argument. 😜'
    })
  })

  // ADD TESTS:
  // - request.get('/test', {})
  // - request.get('/test', '')
})
