import { usePost, Provider } from '..'
import { isServer } from '../utils'
import * as testUtilsDOM from 'react-dom/test-utils'
import ReactDOM from 'react-dom'
import React, { ReactElement, ReactNode } from 'react'
import { Person, PersonView } from './test-utils'
import { FetchMock } from 'jest-fetch-mock'
import * as reactTL from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { waitForElement, render } from '@testing-library/react'

const fetch = global.fetch as FetchMock

const ObjectDestructuringApp = (): ReactElement => {
  const { loading, data, error } = usePost<Person>('https://example.com', {
    body: {
      test: 1,
    },
    onMount: true,
  })
  return <PersonView person={data} loading={loading} error={error} />
}

describe('usePost - general', (): void => {
  it('should be defined/exist when imported', (): void => {
    expect(typeof usePost).toBe('function')
  })

  it('BROWSER: can be used without crashing', async (): Promise<void> => {
    if (isServer) return

    const div = document.createElement('div')

    testUtilsDOM.act((): void => {
      ReactDOM.render(<ObjectDestructuringApp />, div)
    })
  })
})

describe('usePost - BROWSER - general usage', (): void => {
  if (isServer) return

  const data = {
    name: 'Alex Cory',
    age: 29,
  }

  afterEach((): void => {
    fetch.resetMocks()
    reactTL.cleanup()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(JSON.stringify(data))
  })

  it('should execute POST command with object destructuring', async (): Promise<
    void
  > => {
    const { getAllByTestId } = render(<ObjectDestructuringApp />)

    const els = await waitForElement((): HTMLElement[] =>
      getAllByTestId(/^person-/),
    )

    expect(els[0].innerHTML).toBe('Alex Cory')
    expect(els[1].innerHTML).toBe('29')
  })

  it('should work with body in requestInit and onMount: true', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePost('https://example.com', {
        body: data,
        onMount: true,
      }),
    )
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toStrictEqual(data)
  })

  it('should work with Provider URL and no URL as 1st arg with onMount: true', async (): Promise<
    void
  > => {
    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider url="https://example.com">{children as ReactElement}</Provider>
    )
    const { result, waitForNextUpdate } = renderHook(
      () =>
        usePost({
          body: data,
          onMount: true,
        }),
      { wrapper },
    )

    expect(result.current.loading).toBe(true)

    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toStrictEqual(data)
  })

  it('no URL as 1st arg - <Provider url={url} /> - request.post()', async (): Promise<
    void
  > => {
    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <Provider url="https://example.com">{children as ReactElement}</Provider>
    )
    const { result, waitForNextUpdate } = renderHook(
      () =>
        usePost({
          body: data,
        }),
      {
        wrapper,
      },
    )

    result.current.post(data)
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toStrictEqual(data)
  })
})
