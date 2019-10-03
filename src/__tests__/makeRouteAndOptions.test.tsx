import makeRouteAndOptions from '../makeRouteAndOptions'
import { HTTPMethod } from '../types'
import { useRef } from 'react'

describe('makeRouteAndOptions: general usages', (): void => {
  const controller = { current: null } // fake ref

  it('should be defined', (): void => {
    expect(makeRouteAndOptions).toBeDefined()
  })

  it('should form the correct Route', async (): Promise<void> => {
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
      signal: null,
    })
  })

  it('should correctly modify the options with the request interceptor', async (): Promise<void> => {
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
      signal: null,
    })
  })
})

describe('makeRouteAndOptions: Errors', (): void => {
  it('should error if 1st and 2nd arg of doFetch are both objects', (): void => {
    // AKA, the last 2 arguments of makeRouteAndOptions are both objects
    expect((): void => {
      const controller = useRef(null)
      makeRouteAndOptions({}, HTTPMethod.GET, controller, {}, {})
    }).toThrow(Error)
  })
  // ADD TESTS:
  // - request.get('/test', {})
  // - request.get('/test', '')
})
