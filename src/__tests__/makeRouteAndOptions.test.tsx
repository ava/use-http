import makeRouteAndOptions from '../makeRouteAndOptions'
import { HTTPMethod } from '../types'

describe('makeRouteAndOptions: general usages', (): void => {

  it('should be defined', (): void => {
    expect(makeRouteAndOptions).toBeDefined()
  })

  it('should form the correct Route', async (): Promise<void> => {
    const controller = new AbortController()
    const expectedRoute = '/test'
    const { route, options } = await makeRouteAndOptions(
      {},
      HTTPMethod.POST,
      controller,
      expectedRoute,
      {},
    )
    expect(route).toBe(expectedRoute)
    expect(options).toStrictEqual({
      body: '{}',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: controller.signal,
    })
  })

  it('should correctly modify the options with the request interceptor', async (): Promise<void> => {
    const controller = new AbortController()
    const interceptors = {
      request(options: any) {
        options.headers.Authorization = 'Bearer test'
        return options
      }
    }
    const { options } = await makeRouteAndOptions(
      {},
      HTTPMethod.POST,
      controller,
      '/test',
      {},
      interceptors.request,
    )
    expect(options.headers).toHaveProperty('Authorization')
    expect(options).toStrictEqual({
      body: '{}',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test',
      },
      method: 'POST',
      signal: controller.signal,
    })
  })
})

describe('makeRouteAndOptions: Errors', (): void => {
  it('should error if 1st and 2nd arg of doFetch are both objects', async (): Promise<void> => {
    const controller = new AbortController()
    // AKA, the last 2 arguments of makeRouteAndOptions are both objects
    try {
      await makeRouteAndOptions({}, HTTPMethod.GET, controller, {}, {})
    } catch(err) {
      expect(err.name).toBe('Invariant Violation')
      expect(err.message).toBe('If first argument of get() is an object, you cannot have a 2nd argument. 😜')
    }
  })
  // ADD TESTS:
  // - request.get('/test', {})
  // - request.get('/test', '')
})
