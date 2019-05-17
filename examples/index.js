import React from 'react'
import { render } from 'react-dom'
import AbortExamples from './abort-examples'
import GraphQLExamples from './graphql-examples'


function App() {
  return (
    <>
      <AbortExamples />
      <GraphQLExamples />
    </>
  )
}

render(<App />, document.getElementById('root'))
