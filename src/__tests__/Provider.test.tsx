import { Provider } from '..'

/**
 * Many of these tests are dispersed throughout the other
 * tests. Take a look at useFetch.test.tsx
 */
describe('Provider - general', (): void => {
  it('should be defined/exist when imported', (): void => {
    expect(typeof Provider).toBe('function')
  })
})
