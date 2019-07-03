import { useMutation } from '..'

describe('use-http', () => {
  it('should be defined/exist when imported', () => {
    expect(typeof useMutation).toBe("function")
  })
})
