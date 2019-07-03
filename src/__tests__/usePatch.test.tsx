import { usePatch } from '..'

describe('use-http', () => {
  it('should be defined/exist when imported', () => {
    expect(typeof usePatch).toBe("function")
  })
})
