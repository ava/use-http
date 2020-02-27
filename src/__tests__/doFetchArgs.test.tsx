import doFetchArgs from '../doFetchArgs'
import { HTTPMethod } from '../types'

describe('doFetchArgs: general usages', (): void => {
  it('should be defined', (): void => {
    expect(doFetchArgs).toBeDefined()
  })

  it('should form the correct URL', async (): Promise<void> => {
    const controller = new AbortController()
    const expectedRoute = '/test'
    const { url, options } = await doFetchArgs(
      {},
      '',
      '',
      HTTPMethod.POST,
      controller,
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
    const { options, url } = await doFetchArgs(
      {},
      'https://example.com',
      '',
      HTTPMethod.POST,
      controller,
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
    const { url } = await doFetchArgs(
      {},
      'https://example.com',
      '/path',
      HTTPMethod.POST,
      controller,
      '/route',
      {}
    )
    expect(url).toBe('https://example.com/path/route')
  })

  it('should correctly modify the options with the request interceptor', async (): Promise<void> => {
    const controller = new AbortController()
    const interceptors = {
      request (options: any) {
        options.headers.Authorization = 'Bearer test'
        return options
      }
    }
    const { options } = await doFetchArgs(
      {},
      '',
      '',
      HTTPMethod.POST,
      controller,
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
    // AKA, the last 2 arguments of doFetchArgs are both objects
    await expect(doFetchArgs({}, '', '', HTTPMethod.GET, controller, {}, {})).rejects.toThrowError('If first argument of get() is an object, you cannot have a 2nd argument. 😜')
  })

  it('should error if 1st and 2nd arg of doFetch are both arrays', async (): Promise<void> => {
    const controller = new AbortController()
    // AKA, the last 2 arguments of doFetchArgs are both arrays
    await expect(doFetchArgs({}, '', '', HTTPMethod.GET, controller, [], [])).rejects.toThrowError('If first argument of get() is an object, you cannot have a 2nd argument. 😜')
  })

  // ADD TESTS:
  // - request.get('/test', {})
  // - request.get('/test', '')
})
