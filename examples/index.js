import React from 'react'
import { render } from 'react-dom'
import AbortExamples from './abort-examples'

function App() {
  return (
    <>
      <AbortExamples />
    </>
  )
}

render(<App />, document.getElementById('root'))
