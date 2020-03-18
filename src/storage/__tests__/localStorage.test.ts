import { Cache } from '../../types'
import getLocalStorage from '../localStorage'

import mockdate from 'mockdate'

const localStorageMock = (function() {
  const store: any = {}

  return {
    store,
    getItem: function(key: string) {
      return store[key] || null
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString()
    }
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

describe('localStorage cache', () => {
  let cache: Cache
  const cacheLife = 3600000 // an hour

  beforeEach(() => {
    cache = getLocalStorage({ cacheLife })
  })

  afterAll((): void => {
    mockdate.reset()
  })

  beforeAll((): void => {
    mockdate.set('2020-01-01T00:00:00.000Z')
  })

  it('stores and recreates response', async () => {
    const body = 'response body'
    const status = 200
    const statusText = 'OK'
    const headers = new Headers({ 'content-type': 'application/json' })
    const response = new Response(
      body,
      {
        status,
        statusText,
        headers
      }
    )
    const responseID = 'aID'

    await cache.set(responseID, response)
    const received = await cache.get(responseID) as Response

    expect(await received.text()).toEqual(body)
    expect(received.ok).toBeTruthy()
    expect(received.status).toEqual(status)
    expect(received.statusText).toEqual(statusText)
    expect(received.headers.get('content-type')).toEqual('application/json')
  })

  it('clears cache on expiration', async () => {
    const body = 'response body'
    const status = 200
    const statusText = 'OK'
    const headers = new Headers({ 'content-type': 'application/json' })
    const response = new Response(
      body,
      {
        status,
        statusText,
        headers
      }
    )
    const responseID = 'aID'

    await cache.set(responseID, response)
    mockdate.set('2020-01-01T02:00:00.000Z')
    await cache.get(responseID)

    expect(localStorageMock.store.useHTTPcache).toEqual('{}')
  })
})
