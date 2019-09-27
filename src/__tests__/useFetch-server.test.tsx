import { useFetch } from '..'

// import { FetchMock } from 'jest-fetch-mock'

// const fetch = global.fetch as FetchMock

import { renderHook } from '@testing-library/react-hooks'


describe('useFetch - SERVER - basic usage', (): void => {
  it('(for now) should just have `loading = true` when on server', async (): Promise<
    void
  > => {
      if (typeof window !== 'undefined') return
      const { result } = renderHook(() => useFetch('https://example.com'))
      expect(result.current.loading).toBe(true)
  })
})
