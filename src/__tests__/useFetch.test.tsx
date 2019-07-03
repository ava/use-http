import React, { useEffect } from "react"
import { useFetch, Provider } from '../index'
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

interface PersonViewProps {
  id?: string,
  person?: Person
  loading: boolean
  error: any
}

const PersonView: React.FunctionComponent<PersonViewProps> = ({ id = 'person', person, loading, error }) =>
  <>
    {loading && <div data-testid="loading">loading...</div>}
    {error && <div data-testid="error">{error.message}</div>}
    {person &&
      <div>
        <div data-testid={`${id}-name`}>{person.name}</div>
        <div data-testid={`${id}-age`}>{person.age}</div>
      </div>
    }
  </>

const ObjectDestructuringApp = () => {
  const { loading, data, error } = useFetch<Person>('https://example.com', { onMount: true })

  return (
    <PersonView person={data} loading={loading} error={error} />
  )
}

const ArrayDestructuringApp = () => {
  const [person, isLoading, anError] = useFetch<Person>('https://example.com', { onMount: true })

  return (
    <PersonView person={person} loading={isLoading} error={anError} />
  )
}

describe('useFetch - general', () => {
  it('should be defined/exist when imported', () => {
    expect(typeof useFetch).toBe("function")
  })

  it('can be used without crashing', async () => {
    const div = document.createElement("div")

    act(() => {
      ReactDOM.render(<ObjectDestructuringApp />, div)
    })
  })

})

describe("useFetch - basic functionality", () => {
  afterEach(() => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach(() => {
    fetch.mockResponseOnce(JSON.stringify({
      name: "Joe Bloggs",
      age: 48
    }))
  })

  it('should execute GET command with object destructuring', async () => {
    const { getAllByTestId } = render(<ObjectDestructuringApp />)

    const els = await waitForElement(() => getAllByTestId(/^person-/))

    expect(els[0].innerHTML).toBe("Joe Bloggs")
    expect(els[1].innerHTML).toBe("48")
  })

  it('should execute GET command with arrray destructuring', async () => {
    const { getAllByTestId } = render(<ArrayDestructuringApp />)

    const els = await waitForElement(() => getAllByTestId(/^person-/))

    expect(els[0].innerHTML).toBe("Joe Bloggs")
    expect(els[1].innerHTML).toBe("48")
  })

})


// Provider Tests =================================================
/**
 * Test Cases
 * Provider:
 * 1. URL only
 * 2. Options only
 * 3. graphql only
 * 4. URL and Options only
 * 5. URL and graphql only
 * 6. Options and graphql only
 * 7. URL and graphql and Options
 * useFetch:
 * A. const [data, loading, error, request] = useFetch()
 * B. const {data, loading, error, request} = useFetch()
 * C. const [data, loading, error, request] = useFetch('http://url.com')
 * D. const [data, loading, error, request] = useFetch('http://url.com', { onMount: true })
 * E. const [data, loading, error, request] = useFetch({ onMount: true })
 * F. const [data, loading, error, request] = useFetch({ url: 'http://url.com' })
 * G. const [data, loading, error, request] = useFetch(oldOptions => ({ ...newOptions }))
 * H. const [data, loading, error, request] = useFetch('http://url.com', oldOptions => ({ ...newOptions }))
 */
const NoURLOnMountTest = () => {
  const [person, loading, error] = useFetch({ onMount: true })
  return <PersonView id='person-1' person={person} loading={loading} error={error} />
}
const ProviderTest1 = () => (
  <Provider url='https://example.com'><NoURLOnMountTest /></Provider>
)


const NoURLGetUseEffect = () => {
  const [person, loading, error, request] = useFetch()
  useEffect(() => {
    request.get()
  }, [])
  return <PersonView id='person-2' person={person} loading={loading} error={error} />
}
const ProviderTest2 = () => (
  <Provider url='https://example.com'><NoURLGetUseEffect /></Provider>
)


const NoURLGetUseEffectRelativeRoute = () => {
  const [person, loading, error, request] = useFetch()
  useEffect(() => {
    request.get('/people')
  }, [])
  return <PersonView id='person-3' person={person} loading={loading} error={error} />
}
const ProviderTest3 = () => (
  <Provider url='https://example.com'><NoURLGetUseEffectRelativeRoute /></Provider>
)


describe('useFetch - with <Provider />', () => {
  afterEach(() => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach(() => {
    fetch.mockResponseOnce(JSON.stringify({
      name: "Joe Bloggs",
      age: 48
    }))
  })

  it('should execute GET using Provider url: useFetch({ onMount: true })', async () => {
    const { getAllByTestId } = render(<ProviderTest1 />)

    let els = await waitForElement(() => getAllByTestId(/^person-1-/))

    expect(els[0].innerHTML).toBe("Joe Bloggs")
    expect(els[1].innerHTML).toBe("48")
  })

  it ('should execute GET using Provider url: request = useFetch(), request.get()', async () => {
    const { getAllByTestId } = render(<ProviderTest2 />)

    let els = await waitForElement(() => getAllByTestId(/^person-2-/))

    expect(els[0].innerHTML).toBe("Joe Bloggs")
    expect(els[1].innerHTML).toBe("48")

  })

  it ('should execute GET using Provider url: request = useFetch(), request.get("/people")', async () => {
    const { getAllByTestId } = render(<ProviderTest3 />)

    let els = await waitForElement(() => getAllByTestId(/^person-3-/))

    expect(els[0].innerHTML).toBe("Joe Bloggs")
    expect(els[1].innerHTML).toBe("48")
  })
})