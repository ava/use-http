import React, { useState, Fragment, useRef } from 'react'
import { render } from 'react-dom'
import useFetch, { useGet, usePost, usePatch, usePut, useDelete } from '../src/index'

const delayedUrl = 'https://httpbin.org/delay/3'
// chuck: https://api.icndb.com/jokes/random/%3FlimitTo=[nerdy]&escape=javascript - handles POST too
// const allUrl = 'https://km04k9k9x5.codesandbox.io/test.json'
const baseUrl = 'https://jsonplaceholder.typicode.com'
const postUrl = baseUrl + '/posts'
// POST https://jsonplaceholder.typicode.com/posts
const allUrl = postUrl + '/1'
// everything else: https://jsonplaceholder.typicode.com/posts/1



/**
 * Abortable demos
 * - https://github.com/dai-shi/react-hooks-async
 */

const GithubRepoSearchDemo = () => {
  const githubQueryRepoURL = 'https://api.github.com/search/repositories?q='
  const githubRepos = useFetch({
    baseUrl: githubQueryRepoURL,
  })

  const searchGithub = e => githubRepos.get(e.target.value || "%27%27")

  const githubRepoItems = (githubRepos.data || {}).items || []

  return (
    <>
      <h3>Github Repo Search Demo</h3>
      <input onChange={searchGithub} />
      {githubRepos.loading ? (
        <div style={{display: 'flex'}}>
          Loading...
          <button onClick={githubRepos.abort}>Cancel Request</button>
        </div>
      ) : githubRepoItems.map(({ id, name, html_url }) => (
        <li key={id}><a target="_blank" rel="noreferrer noopener" href={html_url}>{name}</a></li>
      ))}
    </>
  )
}

const OnClickAbortDemo = () => {
  const request = useFetch(delayedUrl)
  return (
    <>
      <h3>On Click Demo</h3>
      <button onClick={() => request.post({ no: 'way' })}>Fetch Data</button>
      {request.loading ? (
        <div style={{display: 'flex'}}>
          Loading...
          <button onClick={request.abort}>Cancel Request</button>
        </div>
      ) : (
        <code style={{ display: 'block' }}>
          <pre>{JSON.stringify(request.data, null, 2)}</pre>
        </code>
      )}
    </>
  )
}

function App() {
  return (
    <>
      <div>If for some reason you aren't getting any responses from these, it's possible you have used your daily limit for api calls to these apis.</div>
      <h1>Abort Demos</h1>
      <p>Open the network tab in the devtools to see this in action 😛</p>
      <GithubRepoSearchDemo />
      <OnClickAbortDemo />
    </>
  )
}

render(<App />, document.getElementById('root'))
