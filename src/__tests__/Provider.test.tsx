import { Provider } from '..'

describe('use-http', () => {
  it('should be defined/exist when imported', () => {
    expect(typeof Provider).toBe("function")
  })
})
