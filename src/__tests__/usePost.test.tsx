import { usePost } from '..'

describe('usePost - general', (): void => {
  it('should be defined/exist when imported', (): void => {
    expect(typeof usePost).toBe('function')
  })
})
