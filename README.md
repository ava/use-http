<h1 align="center">useFetch</h1>
<p align="center">🐶 React hook for making isomorphic http requests</p>
<p align="center">
    <a href="https://github.com/alex-cory/use-http/pulls">
      <img src="https://camo.githubusercontent.com/d4e0f63e9613ee474a7dfdc23c240b9795712c96/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e737667" />
    </a>
    <a href="https://circleci.com/gh/alex-cory/use-http">
      <img src="https://img.shields.io/circleci/project/github/alex-cory/use-http/master.svg" />
    </a>
    <a href="https://www.npmjs.com/package/use-http">
      <img src="https://img.shields.io/npm/dt/use-http.svg" />
    </a>
</p>

<img align="right" src="https://media.giphy.com/media/fAFg3xESCJyw/giphy.gif" />
Need to fetch some data? Try this one out. It's an isomorphic fetch hook. That means it works with SSR (server side rendering).

### Examples
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/embed/km04k9k9x5'>Code Sandbox Example</a>

Installation
------------

```shell
yarn add use-http    or    npm i -S use-http
```

Usage
-----
#### Basic Usage

```jsx 
import useFetch from 'use-http'

function Todos() {
  const options = { // accepts all `fetch` options
    onMount: true // will fire on componentDidMount
  }
  
  const todos = useFetch('https://example.com/todos', options)
  
  const addTodo = () => {
    todos.post({
      title: 'no way',
    })
  }

  if (todos.error) return 'Error!'
  if (todos.loading) return 'Loading...'
  
  return (
    <>
      <button onClick={addTodo}>Add Todo</button>
      {todos.data.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      )}
    </>
  )
}
```
#### Destructured methods
```jsx
var [data, loading, error, request] = useFetch('https://example.com')

// want to use object destructuring? You can do that too
var { data, loading, error, request } = useFetch('https://example.com')

request.post({
  no: 'way',
})
```
#### Relative routes
```jsx
const request = useFetch({
  baseUrl: 'https://example.com'
})

request.post('/todos', {
  no: 'way'
})
```
#### Helper hooks

```jsx
import { useGet, usePost, usePatch, usePut, useDelete } from 'use-http'

const [data, loading, error, patch] = usePatch({
  url: 'https://example.com',
  headers: {
    'Content-type': 'application/json; charset=UTF-8'
  }
})

patch({
  yes: 'way',
})
```

#### Abort

<img src="public/abort-example-1.gif" height="250" />


```jsx
const githubRepos = useFetch({
  baseUrl: `https://api.github.com/search/repositories?q=`
})

// the line below is not isomorphic, but for simplicity we're using the browsers `encodeURI`
const searchGithubRepos = e => githubRepos.get(encodeURI(e.target.value))

<>
  <input onChange={searchGithubRepos} />
  <button onClick={githubRepos.abort}>Abort</button>
  {githubRepos.loading ? 'Loading...' : githubRepos.data.items.map(repo => (
    <div key={repo.id}>{repo.name}</div>
  ))}
</>
```

Hooks
----
| Option                | Description                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `useFetch` | The base hook |
| `useGet` | Defaults to a GET request |
| `usePost` | Defaults to a POST request |
| `usePut` | Defaults to a PUT request |
| `usePatch` | Defaults to a PATCH request |
| `useDelete` | Defaults to a DELETE request |

Options
-----

This is exactly what you would pass to the normal js `fetch`, with a little extra.

| Option                | Description                                                               |  Default     |
| --------------------- | --------------------------------------------------------------------------|------------- |
| `onMount` | Once the component mounts, the http request will run immediately | false |
| `baseUrl` | Allows you to set a base path so relative paths can be used for each request :)       | empty string |

```jsx
const {
  data,
  loading,
  error,
  request,
  get,
  post,
  patch,
  put,
  delete // don't destructure `delete` though, it's a keyword
  del,   // <- that's why we have this (del). or use `request.delete`
  abort,
} = useFetch({
  url: 'https://example.com',
  baseUrl: 'https://example.com',
  onMount: true
})
```
or
```jsx
const [data, loading, error, request] = useFetch({
  url: 'https://example.com',
  baseUrl: 'https://example.com',
  onMount: true
})

const {
  get,
  post,
  patch,
  put,
  delete // don't destructure `delete` though, it's a keyword
  del,   // <- that's why we have this (del). or use `request.delete`
  abort,
} = request
```

Credits
--------
use-http is heavily inspired by the popular http client [axios](https://github.com/axios/axios)

Feature Requests/Ideas
----------------------
If you have feature requests, let's talk about them in [this issue](https://github.com/alex-cory/use-http/issues/13)!

Todos
------
 - [ ] Make work with React Suspense [current example WIP](https://codesandbox.io/s/7ww5950no0)
 - [ ] Allow option to fetch on server instead of just having `loading` state
 - [ ] Allow option for callback for response.json() vs response.text()
 - [ ] add `timeout`
 - [ ] add `debounce`
 - [ ] if 2nd param of `post` or one of the methods is a `string` treat it as query params
 - [ ] error handling if no url is passed
 - [ ] tests
 - [ ] port to typescript
 - [ ] badges, I like the way [these guys do it](https://github.com/GitSquared/edex-ui)
 - [ ] if no url is specified, and we're in the browser, use `window.location.href`
 - [ ] github page/website
 - [ ] get it all working on a codesandbox to test SSR on it, also can have api to call locally
 - [ ] potentially GraphQL support
