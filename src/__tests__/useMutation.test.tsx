import { useMutation } from '..'

describe('useMutation - general', (): void => {
  it('should be defined/exist when imported', (): void => {
    expect(typeof useMutation).toBe('function')
  })
})
