import React, { ReactElement } from 'react'

export interface Person {
  name: string
  age: number
}

export interface PersonViewProps {
  id?: string
  person?: Person
  loading: boolean
  error: Error
}

export const PersonView = ({
  id = 'person',
  person,
  loading,
  error,
}: PersonViewProps): ReactElement => (
  <>
    {loading && <div data-testid="loading">loading...</div>}
    {error && <div data-testid="error">{error.message}</div>}
    {person && (
      <div>
        <div data-testid={`${id}-name`}>{person.name}</div>
        <div data-testid={`${id}-age`}>{person.age}</div>
      </div>
    )}
  </>
)
