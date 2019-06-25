import React from "react"
import {
  useFetch,
  useGet,
  useDelete,
  usePost,
  usePut,
  usePatch,
  useQuery,
  useMutation
} from '../index'
import ReactDOM from 'react-dom'
import {
  render,
  cleanup,
  waitForElement
} from '@testing-library/react'

import { FetchMock } from "jest-fetch-mock"

const fetch = global.fetch as FetchMock

import { act } from "react-dom/test-utils"

interface Person {
  name: string
  age: number
}

const TestApp = () => {
  const { loading, data, error } = useFetch<Person>('https://example.com', { onMount: true })

  return (
    <>
      {loading && <div data-testid="loading">loading...</div>}
      {error && <div data-testid="error">{error.message}</div>}
      {data &&
        <div>
          <div data-testid="person-name">{data.name}</div>
          <div data-testid="person-age">{data.age}</div>
        </div>
      }
    </>
  )
}

describe('use-http', () => {
  it('should be defined/exist when imported', () => {
    expect(typeof useFetch).toBe("function")
  })

  it('should define useGet', () => {
    expect(typeof useGet).toBe("function")
  })

  it('should define usePost', () => {
    expect(typeof usePost).toBe("function")
  })

  it('should define usePut', () => {
    expect(typeof usePut).toBe("function")
  })

  it('should define useDelete', () => {
    expect(typeof useDelete).toBe("function")
  })

  it('should define usePatch', () => {
    expect(typeof usePatch).toBe("function")
  })

  it('should define useQuery', () => {
    expect(typeof useQuery).toBe("function")
  })

  it('should define useMutation', () => {
    expect(typeof useMutation).toBe("function")
  })

  it('can be used without crashing', async () => {
    const div = document.createElement("div")

    act(() => {
      ReactDOM.render(<TestApp />, div)
    })
  })

  describe("useFetch", () => {
    afterEach(() => {
      cleanup()
      fetch.resetMocks()
    })

    it('should execute GET command', async () => {
      fetch.mockResponseOnce(JSON.stringify({
        name: "Joe Bloggs",
        age: 48
      }))

      const { getAllByTestId } = render(<TestApp />)

      const els = await waitForElement(() => getAllByTestId(/^person-/))

      expect(els[0].innerHTML).toBe("Joe Bloggs")
      expect(els[1].innerHTML).toBe("48")
    })
  })
})
