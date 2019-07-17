import makeRouteAndOptions from '../makeRouteAndOptions'
import { HTTPMethod } from '../types'
import { useRef } from 'react'

describe('makeRouteAndOptions: general usages', (): void => {
  it('should be defined', (): void => {
    expect(makeRouteAndOptions).toBeDefined()
  })

  it('should form the correct Route', (): void => {
    const controller = { current: null } // fake ref
    const expectedRoute = '/test'
    const { route, options } = makeRouteAndOptions(
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
  console.log('TODO: makeRouteAndOptions')
})
