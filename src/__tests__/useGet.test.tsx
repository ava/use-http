// import React, { ReactElement } from "react"
import { useGet } from '..'
// import ReactDOM from 'react-dom'
import {
  // render,
  cleanup,
  // waitForElement
} from '@testing-library/react'

import { FetchMock } from 'jest-fetch-mock'

const fetch = global.fetch as FetchMock

// import { act } from "react-dom/test-utils"

// interface Person {
//   name: string
//   age: number
// }

// interface PersonViewProps {
//   person?: Person
//   loading: boolean
//   error: Error
// }

// const PersonView = ({ person, loading, error }: PersonViewProps): ReactElement =>
//   <>
//     {loading && <div data-testid="loading">loading...</div>}
//     {error && <div data-testid="error">{error.message}</div>}
//     {person &&
//       <div>
//         <div data-testid="person-name">{person.name}</div>
//         <div data-testid="person-age">{person.age}</div>
//       </div>
//     }
//   </>

// const ObjectDestructuringApp = (): ReactElement => {
//   const { loading, data, error } = useGet<Person>('https://example.com', { onMount: true })

//   return (
//     <PersonView person={data} loading={loading} error={error} />
//   )
// }

// const ArrayDestructuringApp = (): ReactElement => {
//   const [ data, loading, error ] = useGet<Person>('https://example.com', { onMount: true })

//   return (
//     <PersonView person={data} loading={loading} error={error} />
//   )
// }

describe('useGet', (): void => {
  it('should define useGet', (): void => {
    expect(typeof useGet).toBe('function')
  })

  afterEach((): void => {
    cleanup()
    fetch.resetMocks()
  })

  beforeEach((): void => {
    fetch.mockResponseOnce(
      JSON.stringify({
        name: 'Joe Bloggs',
        age: 48,
      }),
    )
  })

  it('should execute GET command with object destructuring', async (): Promise<
    void
  > => {
    fetch.mockResponseOnce(
      JSON.stringify({
        name: 'Joe Bloggs',
        age: 48,
      }),
    )

    // const { getAllByTestId } = render(<ObjectDestructuringApp />)

    // const els = await waitForElement((): HTMLElement[] => getAllByTestId(/^person-/))

    // expect(els[0].innerHTML).toBe("Joe Bloggs")
    // expect(els[1].innerHTML).toBe("48")
  })

  it('should execute GET command with arrray destructuring', async (): Promise<
    void
  > => {
    fetch.mockResponseOnce(
      JSON.stringify({
        name: 'Joe Bloggs',
        age: 48,
      }),
    )

    // const { getAllByTestId } = render(<ArrayDestructuringApp />)

    // const els = await waitForElement((): HTMLElement[] => getAllByTestId(/^person-/))

    // expect(els[0].innerHTML).toBe("Joe Bloggs")
    // expect(els[1].innerHTML).toBe("48")
  })
})
