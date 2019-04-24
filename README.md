<h1 align="center">useFetch</h1>
<p align="center">🐶 React hook for making isomorphic http requests</p>
<p align="center">
    <a href="https://github.com/alex-cory/use-http/pulls">
      <img src="https://camo.githubusercontent.com/d4e0f63e9613ee474a7dfdc23c240b9795712c96/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e737667" />
    </a>
</p>

<img align="right" src="https://media.giphy.com/media/fAFg3xESCJyw/giphy.gif" />
Need to fetch some data? Try this one out. It's an isomorphic fetch hook. That means it works with SSR (server side rendering).

### Examples
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/embed/km04k9k9x5'>Code Sandbox Example</a>


Installation
------------

```shell
yarn add use-http
```

Usage
-----
#### Basic Usage

```jsx 
import useFetch from 'use-http'

function App() {
  const options = { // accepts all `fetch` options
    onMount: true // will fire on componentDidMount
  }
  
  var [data, loading, error, request] = useFetch('https://example.com', options)
  
  // want to use object destructuring? You can do that too
  var { data, loading, error, request } = useFetch('https://example.com')
  
  const postData = () => {
    request.post({
      no: 'way',
    })
  }

  if (error) return 'Error!'
  if (loading) return 'Loading!'
  
  return (
    <>
      <button onClick={postData}>Post Some Data</button>
      <code>
        <pre>{data}</pre>
      </code>
    </>
  )
}
```
#### Destructured methods
```jsx
var [data, loading, error, { post }] = useFetch('https://example.com')

var { data, loading, error, post } = useFetch('https://example.com')

post({
  no: 'way',
})
```
#### Relative routes
```jsx
const [data, loading, error, request] = useFetch({
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

#### Coming Soon: `abort`

```jsx
const { data, loading, request } = useFetch({
  baseUrl: `https://api.github.com/search`
})

const searchGithub = e => request.get(`/repositories?q=${e.target.value || "''"}`)

<>
  <input onChange={searchGithub} />
  <button onClick={request.abort}>Abort</button>
  {loading ? 'Loading...' : <code><pre>{data}</pre></code>}
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
  del,
  // delete
} = useFetch({
  url: 'https://example.com',
  baseUrl: 'https://example.com',
  onMount: true
})
```

Credits
--------
use-http is heavily inspired by the popular http client [axios](https://github.com/axios/axios) 

Todos
------
 - [ ] Make abortable (add `abort` to abort the http request)
 - [ ] Make work with React Suspense
 - [ ] Allow option to fetch on server instead of just having `loading` state
 - [ ] Allow option for callback for response.json() vs response.text()
 - [ ] add `timeout`
 - [ ] error handling if no url is passed
 - [ ] tests
