import React, { ReactElement } from 'react'
import { useFetch, Provider } from '..'
import ReactDOM from 'react-dom'
import { cleanup } from '@testing-library/react'
import { isServer, isBrowser } from '../utils'
import { PersonView, Person } from './test-utils'

import { FetchMock } from 'jest-fetch-mock'

const fetch = global.fetch as FetchMock

import * as testUtilsDOM from 'react-dom/test-utils'
import { renderHook } from '@testing-library/react-hooks'

const ObjectDestructuringApp = (): ReactElement => {
  const { loading, data, error } = useFetch<Person>('https://example.com', {
    onMount: true,
  })

  return <PersonView person={data} loading={loading} error={error} />
}

describe('useFetch - general', (): void => {
  it('should be defined/exist when imported', (): void => {})

  it('BROWSER: can be used without crashing', async (): Promise<void> => {
    if (isServer) return

    const div = document.createElement('div')

    testUtilsDOM.act((): void => {
      ReactDOM.render(<ObjectDestructuringApp />, div)
    })
  })
})

describe('useFetch - BROWSER - basic functionality', (): void => {
  if (isServer) return

  const expected = {
    name: 'Alex Cory',
    age: 29,
  }

  const wrapper = ({ children }: { children: ReactElement }) => <Provider url="https://example.com">{children}</Provider>

  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(
      JSON.stringify(expected),
    )
  })

  it('should execute GET command with object destructuring', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ onMount: true }),
      { wrapper: wrapper as React.ComponentType }
    )

    expect(result.current.data).toBe(undefined)
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(undefined)
    expect(result.current.request.data).toBe(undefined)
    expect(result.current.response.data).toEqual(undefined)
    expect(result.current.request.loading).toBe(true)

    await waitForNextUpdate()

    expect(result.current.request.data).toEqual(expected)
    expect(result.current.data).toEqual(expected)
    expect(result.current.response.data).toEqual(expected)
    expect(result.current.request.loading).toBe(false)
    expect(result.current.loading).toBe(false)


    expect(typeof result.current.get).toBe('function')
    expect(typeof result.current.post).toBe('function')
    expect(typeof result.current.patch).toBe('function')
    expect(typeof result.current.put).toBe('function')
    expect(typeof result.current.delete).toBe('function')
    expect(typeof result.current.del).toBe('function')
    expect(typeof result.current.abort).toBe('function')
    expect(typeof result.current.query).toBe('function')
    expect(typeof result.current.mutate).toBe('function') 
  })

  it('should execute GET command with arrray destructuring', async (): Promise<
    void
  > => {
    // const { result, waitForNextUpdate } = renderHook(
    //   () => useFetch({ onMount: true }),
    //   { wrapper: wrapper as React.ComponentType }
    // )

    // const [request, response, loading, error] = result.current
    // expect(request.loading).toBe(true)
    // expect(loading).toBe(true)
    // expect(error).toBe(undefined)
    // await waitForNextUpdate()
    // expect(response.data).toEqual(expected)
    // expect(request.loading).toBe(false)
    // expect(loading).toBe(false)
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

describe('useFetch - BROWSER - with <Provider />', (): void => {
  if (isServer) return

  const expected = {
    name: 'Alex Cory',
    age: 29,
  }

  const wrapper = ({ children }: { children: ReactElement }) => <Provider url="https://example.com">{children}</Provider>

  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(
      JSON.stringify(expected),
    )
  })

  it('should execute GET using Provider url: useFetch({ onMount: true })', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch({ onMount: true }),
      { wrapper: wrapper as React.ComponentType }
    )

    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should execute GET using Provider url: request = useFetch(), request.get()', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch(),
      { wrapper: wrapper as React.ComponentType }
    )
    expect(result.current.loading).toBe(false)
    result.current.get()
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })

  it('should execute GET using Provider url: request = useFetch(), request.get("/people")', async (): Promise<
    void
  > => {
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch(),
      { wrapper: wrapper as React.ComponentType }
    )
    expect(result.current.loading).toBe(false)
    result.current.get('/people')
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toMatchObject(expected)
  })
})

// const ManagedStateTest = (): ReactElement => {
//   const [todos, setTodos] = useState<{ title: string }[]>([{ title: 'test' }])

//   const { get, post, abort, error, loading } = useFetch('http:example.com')

//   const initializeTodos = useCallback(async (): Promise<void> => {
//     const initialTodos = await get('/todos')
//     setTodos((todos: { title: string }[]): { title: string }[] => [
//       ...todos,
//       ...(initialTodos || []),
//     ])
//   }, [get, setTodos])

//   useEffect((): (() => void) => {
//     initializeTodos()
//     return abort
//   }, [initializeTodos, abort])

//   const addTodo = useCallback(async (): Promise<void> => {
//     const data = {
//       title: 'No way...',
//     }
//     const newTodo = await post('/todos', data)
//     setTodos((oldTodos): { title: string }[] => [...oldTodos, newTodo])
//   }, [post, setTodos])

//   return (
//     <>
//       <button data-testid="todos-1-add-todo" onClick={addTodo}>
//         Add Todo
//       </button>
//       {error && <div>Error!</div>}
//       <div data-testid="todos-1-loading">{loading ? 'Loading...' : ''}</div>
//       <div>
//         {todos.length > 0 &&
//           todos.map(
//             ({ title }, i): ReactElement => (
//               <div data-testid="todos-1" key={i}>
//                 {title}
//               </div>
//             ),
//           )}
//       </div>
//     </>
//   )
// }

describe('useFetch - BROWSER - with <Provider /> - Managed State', (): void => {
  if (isServer) return

  const expected = { title: 'Alex Cory' }
 

  const wrapper = ({ children }: { children: ReactElement }) => <Provider url="https://example.com">{children}</Provider>

  afterEach((): void => {
    fetch.resetMocks()
    cleanup()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(
      JSON.stringify(expected),
    )
  })

  it('should return response data when awaiting. i.e. const todos = await get("/todos")', async (): Promise<void> => {
    const { result } = renderHook(
      () => useFetch(),
      { wrapper: wrapper as React.ComponentType }
    )
    expect(result.current.loading).toBe(false)
    const responseData = await result.current.post('/people', expected)
    expect(responseData).toEqual(expected)
    expect(result.current.data).toEqual(expected)
    expect(result.current.loading).toBe(false)
  })
})

describe('useFetch - SERVER - basic usage', (): void => {
  if (isBrowser) return

  it('(for now) should just have `loading = true` when on server', async (): Promise<
    void
  > => {
    //   const { result, waitForNextUpdate } = renderHook(() => useFetch('https://example.com'))
    //   console.log('RES: ', result.current)
    //   // let todos: {title: number}[] = []
    //   const getTodos = async () => {
    //     /* todos = */ await request.current.get('/todos')
    //   }
    //   act(() => {
    //     getTodos()
    //   })
    //   await waitForNextUpdate()
    //   // console.log('TODOS: ', todos)
  })
})
