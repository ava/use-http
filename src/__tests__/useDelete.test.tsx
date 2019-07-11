import { useDelete } from '..'

describe('useDelete - general', (): void => {
  it('should be defined/exist when imported', (): void => {
    expect(typeof useDelete).toBe("function")
  })
})
