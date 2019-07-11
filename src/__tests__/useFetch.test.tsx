import React, { useEffect, useState, useCallback, ReactElement } from 'react'
import { useFetch, Provider } from '../index'
import ReactDOM from 'react-dom'
import {
  render,
  cleanup,
  waitForElement,
  RenderResult
} from '@testing-library/react'

import { FetchMock } from "jest-fetch-mock"

const fetch = global.fetch as FetchMock

import { act } from "react-dom/test-utils"

interface Person {
  name: string
  age: number
}

interface PersonViewProps {
  id?: string
  person?: Person
  loading: boolean
  error: Error
}

const PersonView = ({ id = 'person', person, loading, error }: PersonViewProps): ReactElement =>
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

const ObjectDestructuringApp = (): ReactElement => {
  const { loading, data, error } = useFetch<Person>('https://example.com', { onMount: true })

  return (
    <PersonView person={data} loading={loading} error={error} />
  )
}

const ArrayDestructuringApp = (): ReactElement => {
  const [person, isLoading, anError] = useFetch<Person>('https://example.com', { onMount: true })

  return (
    <PersonView person={person} loading={isLoading} error={anError} />
  )
}

describe('useFetch - general', (): void => {
  it('should be defined/exist when imported', (): void => {
    expect(typeof useFetch).toBe("function")
  })

  it('can be used without crashing', async (): Promise<void> => {
    const div = document.createElement("div")

    act((): void => {
      ReactDOM.render(<ObjectDestructuringApp />, div)
    })
  })

})

describe("useFetch - basic functionality", (): void => {
  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(JSON.stringify({
      name: "Joe Bloggs",
      age: 48
    }))
  })

  it('should execute GET command with object destructuring', async (): Promise<void> => {
    const { getAllByTestId } = render(<ObjectDestructuringApp />)

    const els = await waitForElement((): HTMLElement[] => getAllByTestId(/^person-/))

    expect(els[0].innerHTML).toBe("Joe Bloggs")
    expect(els[1].innerHTML).toBe("48")
  })

  it('should execute GET command with arrray destructuring', async (): Promise<void> => {
    const { getAllByTestId } = render(<ArrayDestructuringApp />)

    const els = await waitForElement((): HTMLElement[] => getAllByTestId(/^person-/))

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
 * Errors:
 * SSR Tests:
 */
const NoURLOnMountTest = (): ReactElement => {
  const [person, loading, error] = useFetch({ onMount: true })
  return <PersonView id='person-1' person={person} loading={loading} error={error} />
}

const NoURLGetUseEffect = (): ReactElement => {
  const [person, loading, error, request] = useFetch()
  useEffect((): void => {
    request.get()
  }, [request])
  return <PersonView id='person-2' person={person} loading={loading} error={error} />
}

const NoURLGetUseEffectRelativeRoute = (): ReactElement => {
  const [person, loading, error, request] = useFetch()
  useEffect((): void => {
    request.get('/people')
  }, [request])
  return <PersonView id='person-3' person={person} loading={loading} error={error} />
}


const ManagedStateTest = (): ReactElement => {
  const [todos, setTodos] = useState<{title: string}[]>([])

  // const [data, loading, error, request, setData] = useFetch()
  const request = useFetch('http:example.com', {
    // initial data, probably just an empty default as this will get overwritten
    // each time `request.method()` is called
    // data: []
  })

  const initializeTodos = useCallback(async (): Promise<void> => {
    const initialTodos = await request.get('/todos')
    setTodos((): {title: string}[] => initialTodos || [])
  }, [request, setTodos])

  useEffect((): void => {
    initializeTodos()
  }, [initializeTodos])

  async function addTodo(): Promise<void> {
    const newTodo = await request.post('/todos', {
      title: 'No way...'
    })
    setTodos((oldTodos): {title: string}[] => [...oldTodos, newTodo])
    // request.loading = false
  }

  return (
    <>
      <button onClick={addTodo}>Add Todo</button>
      {request.error && <div>Error!</div>}
      {request.loading && <div>Loading...</div>}
      <div data-testid='todos-1'>
        {todos.length > 0 && todos.map(({ title }): ReactElement => <div key={title}>{title}</div>)}
        {/* {todos.length > 0 && todos.map((todo, i): ReactElement => <div key={i}>{todo.title}</div>} */}
      </div>
    </>
  )
}

const renderWithProvider = (comp: ReactElement): RenderResult => render(
  <Provider url='https://example.com'>{comp}</Provider>
)

describe('useFetch - with <Provider />', (): void => {
  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(JSON.stringify({
      name: "Joe Bloggs",
      age: 48
    }))
  })

  it('should execute GET using Provider url: useFetch({ onMount: true })', async (): Promise<void> => {
    const { getAllByTestId } = renderWithProvider(<NoURLOnMountTest />)

    let els = await waitForElement((): HTMLElement[] => getAllByTestId(/^person-1-/))

    expect(els[0].innerHTML).toBe("Joe Bloggs")
    expect(els[1].innerHTML).toBe("48")
  })

  it ('should execute GET using Provider url: request = useFetch(), request.get()', async (): Promise<void> => {
    const { getAllByTestId } = renderWithProvider(<NoURLGetUseEffect />)

    let els = await waitForElement((): HTMLElement[] => getAllByTestId(/^person-2-/))

    expect(els[0].innerHTML).toBe("Joe Bloggs")
    expect(els[1].innerHTML).toBe("48")

  })

  it ('should execute GET using Provider url: request = useFetch(), request.get("/people")', async (): Promise<void> => {
    const { getAllByTestId } = renderWithProvider(<NoURLGetUseEffectRelativeRoute />)

    let els = await waitForElement((): HTMLElement[] => getAllByTestId(/^person-3-/))

    expect(els[0].innerHTML).toBe("Joe Bloggs")
    expect(els[1].innerHTML).toBe("48")
  })

  it ('should execute GET using Provider url: request = useFetch(), request.get("/people")', async (): Promise<void> => {
    fetch.mockResponseOnce(JSON.stringify([{
      todo: 1
    },{
      todo: 2
    }]))
    const { getAllByTestId } = renderWithProvider(<ManagedStateTest />)

    let els = await waitForElement((): HTMLElement[] => getAllByTestId(/^person-4-/))
    console.log('ELS: ', els)

    expect(els[0].innerHTML).toBe("Joe Bloggs")
    expect(els[1].innerHTML).toBe("48")
  })
})