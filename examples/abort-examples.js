import React from 'react'
import useFetch from '../src/index'
import { delayedUrl } from './urls'

const GithubRepoSearchAbortDemo = () => {
  const githubQueryRepoURL = 'https://api.github.com/search/repositories?q='
  const githubRepos = useFetch({
    url: githubQueryRepoURL,
  })

  const searchGithub = e => githubRepos.get(e.target.value || '%27%27')

  const githubRepoItems = (githubRepos.data || {}).items || []

  return (
    <>
      <h3>Github Repo Search Demo</h3>
      <input onChange={searchGithub} />
      {githubRepos.loading ? (
        <div style={{ display: 'flex' }}>
          Loading...
          <button onClick={githubRepos.abort}>Cancel Request</button>
        </div>
      ) : (
        githubRepoItems.map(({ id, name, html_url: htmlURL }) => (
          <li key={id}>
            <a target="_blank" rel="noreferrer noopener" href={htmlURL}>
              {name}
            </a>
          </li>
        ))
      )}
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
        <div style={{ display: 'flex' }}>
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

const AbortDemos = () => (
  <>
    <div>
      If for some reason you aren‘t getting any responses from these, it‘s
      possible you have used your daily limit for api calls to these apis.
    </div>
    <h1>Abort Demos</h1>
    <p>Open the network tab in the devtools to see this in action 😛</p>
    <GithubRepoSearchAbortDemo />
    <OnClickAbortDemo />
  </>
)

export default AbortDemos
