import { usePost } from '..'

describe('use-http', () => {
  it('should be defined/exist when imported', () => {
    expect(typeof usePost).toBe("function")
  })
})