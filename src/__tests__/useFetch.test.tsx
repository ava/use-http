import React, { useEffect, useState, useCallback, ReactElement } from 'react'
import { useFetch, Provider } from '..'
import ReactDOM from 'react-dom'
import { render, cleanup, waitForElement, RenderResult, fireEvent } from '@testing-library/react'
// import * as reactTest from '@testing-library/react'
// console.log('REACT TEST: ', reactTest)

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

})


const ManagedStateTest = (): ReactElement => {
  const [todos, setTodos] = useState<{title: string}[]>([{title: 'test'}])

  // const [data, loading, error, request, setData] = useFetch()
  const request = useFetch('http:example.com', {
    // initial data, probably just an empty default as this will get overwritten
    // each time `request.method()` is called
    // data: []
  })

  const initializeTodos = useCallback(async (): Promise<void> => {
    const initialTodos = await request.get('/todos')
    console.log('INITIAL TODOS: ', initialTodos)
    setTodos((): {title: string}[] => [...todos, ...(initialTodos || [])])
  }, [request.get, setTodos])

  useEffect((): () => void => {
    initializeTodos()
    return request.abort
  }, [initializeTodos])

  const addTodo = useCallback(async (): Promise<void> => {
    const data = {
      title: 'No way...'
    }
    /* const newTodo = */ await request.post('/todos', data)
    setTodos((oldTodos): {title: string}[] => [...oldTodos, /* newTodo */ data])
    // request.loading = false
  }, [request.post, setTodos])

  console.log('TODOS: ', todos)
  return (
    <>
      <button data-testid='todos-1-add-todo' onClick={addTodo}>Add Todo</button>
      {request.error && <div>Error!</div>}
      <div data-testid='todos-1-loading'>{request.loading ? 'Loading...' : ''}</div>
      <div >
        {todos.length > 0 && todos.map(({ title }, i): ReactElement => (
          // console.log(`TITLE-${i}: `, title),
          <div data-testid='todos-1' key={i}>{title}</div>
        ))}
        {/* {todos.length > 0 && todos.map((todo, i): ReactElement => <div key={i}>{todo.title}</div>} */}
      </div>
    </>
  )
} 


describe('useFetch - with <Provider /> - Managed State', (): void => {
  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(JSON.stringify([{
      title: 1
    },{
      title: 2
    }]))
  })

  it ('should execute GET using Provider url: request = useFetch(), request.get("/todos")', async (): Promise<void> => {
    const { getAllByTestId, getByTestId } = renderWithProvider(<ManagedStateTest />)

    let loading = getByTestId('todos-1-loading')
    // expect(loading.innerHTML).toBe('Loading...')
    // TODO:
    // below breaks. Put `console.log('TODOS: ', todos)` just before the `return` in `ManagedStateTest`
    // component. Then comment out the 2 lines below and re-run test. The output of TODOS != ELS. I'm probably writing my test wrong or something. Help please :)
    let els = await waitForElement((): HTMLElement[] => getAllByTestId(/^todos-1/))
    console.log('ELS: ', els.map(el => el.innerHTML))
    expect(els[2].innerHTML).toBe('test')
    // expect(els[2].innerHTML).toBe(1)
    // expect(els[3].innerHTML).toBe(2)

    const button = getByTestId('todos-1-add-todo')
    act(() => {
      fireEvent.click(button)
    })
    console.log('LOADING: ', loading.innerHTML)
    els = await waitForElement((): HTMLElement[] => getAllByTestId(/^todos-1/))
    // why does TODOS show the correct data, but `ELS 2` not?
    console.log('ELS 2: ', els.map(el => el.innerHTML))
  })

  // it ('should execute GET using Provider url: request = useFetch(), request.get("/todos")', async (): Promise<void> => {
  //   const { result: request, waitForNextUpdate } = renderHook(() => useFetch('https://example.com'))

  //   act(() => {
  //     request.current.get('/todos')
  //   })
  //   await waitForNextUpdate()
  //   // expect(request.current.data).toBe([{ todo: 1 }, { todo: 2 }])
  //   // console.log('REQ: ', request.current)
  // })
})