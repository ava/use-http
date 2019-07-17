/* eslint-disable @typescript-eslint/no-explicit-any */
import makeRouteAndOptions from '../makeRouteAndOptions'
import { HTTPMethod } from '../types'
import { useRef } from 'react'

describe('makeRouteAndOptions: general usages', (): void => {
  it('should be defined', (): void => {
    expect(makeRouteAndOptions).toBeDefined()
  })
  console.log('TODO: makeRouteAndOptions')
})

describe('makeRouteAndOptions: Errors', (): void => {
  it('should error if 1st and 2nd arg of doFetch are both objects', (): void => {
    // AKA, the last 2 arguments of makeRouteAndOptions are both objects
    expect((): void => {
      const controller = useRef(null)
      makeRouteAndOptions({}, HTTPMethod.GET, controller, {}, {})
    }).toThrow(Error)
  })
})
