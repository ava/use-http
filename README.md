<a href="http://use-http.com">
    <img src="https://github.com/alex-cory/use-http/raw/master/public/dog.png" />
</a>

<br/>

<p align="center">
    <h1 align="center">useFetch</h1>
</p>

<br />

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
    <a href="https://lgtm.com/projects/g/alex-cory/use-http/context:javascript">
      <img alt="undefined" src="https://img.shields.io/lgtm/grade/javascript/g/alex-cory/use-http.svg?logo=lgtm&logoWidth=18"/>
    </a>
    <a href="https://spectrum.chat/use-http">
        <img src="https://withspectrum.github.io/badge/badge.svg" />
    </a>
<!-- [![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/next-js) -->
<!--     <a href="https://bundlephobia.com/result?p=use-http">
      <img alt="undefined" src="https://img.shields.io/bundlephobia/minzip/use-http.svg">
    </a> -->
<!--     <a href="https://snyk.io/test/github/alex-cory/use-http?targetFile=package.json">
      <img src="https://snyk.io/test/github/alex-cory/use-http/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/alex-cory/use-http?targetFile=package.json" style="max-width:100%;">
    </a> -->
<!--     <a href="https://www.npmjs.com/package/use-http">
      <img src="https://img.shields.io/npm/v/use-http.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/alex-cory/use-http?targetFile=package.json" style="max-width:100%;">
    </a> -->
<!--     <a href="https://github.com/alex-cory/use-http/blob/master/license.md">
      <img alt="undefined" src="https://img.shields.io/github/license/alex-cory/use-http.svg">
    </a> -->
<!--     <a href="https://greenkeeper.io/">
      <img alt="undefined" src="https://badges.greenkeeper.io/alex-cory/use-http.svg">
    </a> -->
</p>

<div align="center">
  <sup>
    🐶 React hook for making isomorphic http requests
    <br/>
      <a href="http://use-http.com"><b>Main Documentation</b></a>
  </sup>
</div>

<br/>
<br/>


<div align="center">
  <pre>npm i <a href="http://use-http.com">use-http</a></pre>
</div>

<br/>
<br/>

Features
---------

- SSR (server side rendering) support
- TypeScript support
- 1 dependency ([use-ssr](https://github.com/alex-cory/use-ssr))
- GraphQL support (queries + mutations)
- Provider to set default `url` and `options`

Usage
-----

<details><summary><b>⚠️ Examples <sup>click me</sup></b></summary>
  <ul>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-in-nextjs-nn9fm'>useFetch + Next.js</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/embed/km04k9k9x5'>useFetch + create-react-app</a></li>
  </ul>
</details>

<details open><summary><b>Basic Usage (managed state) <code>useFetch</code></b></summary>

```js
import useFetch from 'use-http'

function Todos() {
  const [todos, setTodos] = useState([])

  const [request, response] = useFetch('https://example.com')

  // componentDidMount
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      initializeTodos()
      mounted.current= true
    }
  })
  
  async function initializeTodos() {
    const initialTodos = await request.get('/todos')
    if (response.ok) setTodos(initialTodos)
  }

  async function addTodo() {
    const newTodo = await request.post('/todos', {
      title: 'no way',
    })
    if (response.ok) setTodos([...todos, newTodo])
  }

  return (
    <>
      <button onClick={addTodo}>Add Todo</button>
      {request.error && 'Error!'}
      {request.loading && 'Loading...'}
      {todos.length > 0 && todos.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      )}
    </>
  )
}
```
</details>

<details open><summary><b>Basic Usage (no managed state) <code>useFetch</code></b></summary>
    
```js
import useFetch from 'use-http'

function Todos() {
  const options = { // accepts all `fetch` options
    onMount: true,  // will fire on componentDidMount (GET by default)
    data: []        // setting default for `data` as array instead of undefined
  }

  const { loading, error, data, post } = useFetch('https://example.com/todos', options)

  return (
    <>
      {error && 'Error!'}
      {loading && 'Loading...'}
      {!loading && data.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      )}
    </>
  )
}
```
</details>

<details open><summary><b>Destructured <code>useFetch</code></b></summary>

```js
var [request, response, loading, error] = useFetch('https://example.com')

// want to use object destructuring? You can do that too
var {
  request,
  response,
  loading,
  error,
  data,
  get,
  post,
  put,
  patch,
  delete  // don't destructure `delete` though, it's a keyword
  del,    // <- that's why we have this (del). or use `request.delete`
  mutate, // GraphQL
  query,  // GraphQL
  abort
} = useFetch('https://example.com')

var {
  loading,
  error,
  data,
  get,
  post,
  put,
  patch,
  delete  // don't destructure `delete` though, it's a keyword
  del,    // <- that's why we have this (del). or use `request.delete`
  mutate, // GraphQL
  query,  // GraphQL
  abort
} = request

var {
  data,
  ok,
  headers,
  ...restOfHttpResponse // everything you would get in a response from an http request
} = response
```
</details>


<details><summary><b>Relative routes <code>useFetch</code></b></summary>

⚠️ `baseUrl` is no longer supported, it is now only `url`
```jsx
var request = useFetch({ url: 'https://example.com' })
// OR
var request = useFetch('https://example.com')

request.post('/todos', {
  no: 'way'
})
```
</details>


<details><summary><b>Abort <code>useFetch</code></b></summary>

<img src="public/abort-example-1.gif" height="250" />


```jsx
const githubRepos = useFetch({
  url: `https://api.github.com/search/repositories?q=`
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
</details>


<details><summary><b>GraphQL Query <code>useFetch</code></b></summary>

```jsx

const QUERY = `
  query Todos($userID string!) {
    todos(userID: $userID) {
      id
      title
    }
  }
`

function App() {
  const request = useFetch('http://example.com')

  const getTodosForUser = id => request.query(QUERY, { userID: id })

  return (
    <>
      <button onClick={() => getTodosForUser('theUsersID')}>Get User's Todos</button>
      {request.loading ? 'Loading...' : <pre>{request.data}</pre>}
    </>
  )
}
```
</details>


<details><summary><b>GraphQL Mutation <code>useFetch</code></b></summary>

The `Provider` allows us to set a default `url`, `options` (such as headers) and so on.

```jsx

const MUTATION = `
  mutation CreateTodo($todoTitle string) {
    todo(title: $todoTitle) {
      id
      title
    }
  }
`

function App() {
  const [todoTitle, setTodoTitle] = useState('')
  const request = useFetch('http://example.com')

  const createtodo = () => request.mutate(MUTATION, { todoTitle })

  return (
    <>
      <input onChange={e => setTodoTitle(e.target.value)} />
      <button onClick={createTodo}>Create Todo</button>
      {request.loading ? 'Loading...' : <pre>{request.data}</pre>}
    </>
  )
}
```
</details>


<details><summary><b><code>Provider</code> using the GraphQL <code>useMutation</code> and <code>useQuery</code></b></summary>

##### Query for todos
```jsx
import { useQuery } from 'use-http'

export default function QueryComponent() {
  
  // can also do it this way:
  // const [data, loading, error, query] = useQuery`
  // or this way:
  // const { data, loading, error, query } = useQuery`
  const request = useQuery`
    query Todos($userID string!) {
      todos(userID: $userID) {
        id
        title
      }
    }
  `

  const getTodosForUser = id => request.query({ userID: id })
  
  return (
    <>
      <button onClick={() => getTodosForUser('theUsersID')}>Get User's Todos</button>
      {request.loading ? 'Loading...' : <pre>{request.data}</pre>}
    </>
  )
}
```

##### Add a new todo
```jsx
import { useMutation } from 'use-http'

export default function MutationComponent() {
  const [todoTitle, setTodoTitle] = useState('')
  
  // can also do it this way:
  // const request = useMutation`
  // or this way:
  // const { data, loading, error, mutate } = useMutation`
  const [data, loading, error, mutate] = useMutation`
    mutation CreateTodo($todoTitle string) {
      todo(title: $todoTitle) {
        id
        title
      }
    }
  `
  
  const createTodo = () => mutate({ todoTitle })

  return (
    <>
      <input onChange={e => setTodoTitle(e.target.value)} />
      <button onClick={createTodo}>Create Todo</button>
      {loading ? 'Loading...' : <pre>{data}</pre>}
    </>
  )
}
```


##### Adding the Provider
These props are defaults used in every request inside the `<Provider />`. They can be overwritten individually
```jsx
import { Provider } from 'use-http'
import QueryComponent from './QueryComponent'
import MutationComponent from './MutationComponent'

function App() {

  const options = {
    headers: {
      Authorization: 'Bearer YOUR_TOKEN_HERE'
    }
  }
  
  return (
    <Provider url='http://example.com' options={options}>
      <QueryComponent />
      <MutationComponent />
    <Provider/>
  )
}

```
</details>


Overview
--------

### Hooks

| Hook                | Description                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `useFetch` | The base hook |
| `useQuery` | For making a GraphQL query |
| `useMutation` | For making a GraphQL mutation |
    
</details>


### Options
    
This is exactly what you would pass to the normal js `fetch`, with a little extra.

| Option                | Description                                                               |  Default     |
| --------------------- | --------------------------------------------------------------------------|------------- |
| `onMount` | Once the component mounts, the http request will run immediately | false |
| `url` | Allows you to set a base path so relative paths can be used for each request :)       | empty string |
| `data` | Allows you to set a default value for `data`       | `undefined` |
| `loading` | Allows you to set default value for `loading`       | `false` unless `onMount === true` |

```jsx
useFetch({
  // accepts all `fetch` options such as headers, method, etc.
  url: 'https://example.com', // used to be `baseUrl`
  onMount: true,
  data: [],                   // default for `data` field
  loading: false,             // default for `loading` field
})
```


Feature Requests/Ideas
----------------------
If you have feature requests, let's talk about them in [this issue](https://github.com/alex-cory/use-http/issues/13)!

Todos
------
 - [ ] tests
   - [ ] tests for SSR
   - [ ] tests for FormData (can also do it for react-native at same time. [see here](https://stackoverflow.com/questions/45842088/react-native-mocking-formdata-in-unit-tests))
   - [ ] tests for GraphQL hooks `useMutation` + `useQuery`
 - [ ] react native support
 - [ ] documentation for FormData
 - [ ] Make work with React Suspense [current example WIP](https://codesandbox.io/s/7ww5950no0)
 - [ ] get it all working on a SSR codesandbox, this way we can have api to call locally
 - [ ] Allow option to fetch on server instead of just having `loading` state
 - [ ] add `timeout`
 - [ ] maybe add a `retry: 3` which would specify the amount of times it should retry before erroring out
 - [ ] make GraphQL work with React Suspense
 - [ ] make GraphQL examples in codesandbox
 - [ ] Documentation:
     - [ ] show comparison with Apollo
 - [ ] Interceptors (potential syntax example) this shows how to get access tokens on each request if an access token or refresh token is expired
```jsx
const App = () => {
  const { get } = useFetch('https://example.com')
  const [accessToken, setAccessToken] = useLocalStorage('access-token')
  const [refreshToken, setRefreshToken] = useLocalStorage('refresh-token')
  const { history } = useReactRouter()
  const options = {
    interceptors: {
      async request(opts) {
        let headers = {}
        // refresh token expires in 1 day, used to get access token
        if (!refreshToken || isExpired(refreshToken)) {
          return history.push('/login')
        }
        // access token expires every 15 minutes, use refresh token to get new access token
        if (!accessToken || isExpired(accessToken)) {
          const access = await get(`/access-token?refreshToken=${refreshToken}`)
          setAccessToken(access)
          headers = {
            Authorization: `Bearer ${access}`,
          }
        }
        const finalOptions = {
          ...opts,
          headers: {
            ...opts.headers,
            ...headers,
          },
        }
        return finalOptions
      },
    },
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
  return (
    <Provider url='https://example.com' options={options}>
      <App />
    </Provider>
  )
}
```
 - [ ] Dedupe requests done to the same endpoint. Only one request to the same endpoint will be initiated. [ref](https://www.npmjs.com/package/@bjornagh/use-fetch)
 - [ ] Cache responses to improve speed and reduce amount of requests
 - [ ] maybe add syntax for inline headers like this
```jsx
  const user = useFetch()
  
  user
    .headers({
      auth: jwt
    })
    .get()
```
  - [ ] maybe add snake_case -> camelCase option to `<Provider />`. This would
        convert all the keys in the response to camelCase.
        Not exactly sure how this syntax should look because what
        if you want to have this only go 1 layer deep into the response
        object. Or if this is just out of scope for this library.
  ```jsx
  <Provider responseKeys={{ case: 'camel' }}><App /></Provider>
  ```
  - [ ] potential syntax `onUpdate`
  ```jsx
  const request = useFetch('url', {
    onUpdate: [props.id] // everytime props.id is updated, it will re-run the request GET in this case
  })
  ```
  - [ ] see if you can make this work without causing infinite loop when having `request` as a dependency of `useEffect`. I wish the exhaustive dependencies would allow you to do `[request.get]` instead of forcing `[request]`. It doesn't cause infinite loop with `[request.get]` and that's the only method being used inside `useEffect`
  - [ ] add callback to completely overwrite options. Let's say you have `<Provider url='url.com' options={{ headers: 'Auth': 'some-token' }}><App /></Provider>`, but for one api call, you don't want that header in your `useFetch` at all for one instance in your app. This would allow you to remove that
  ```jsx
  const request = useFetch('https://url.com', globalOptions => {
    delete globalOptions.headers.Authorization
    return globalOptions
  })
  ```

<details><summary><b>The Goal With Suspense <sup><strong>(not implemented yet)</strong></sup></b></summary>
    
```jsx
import React, { Suspense, unstable_ConcurrentMode as ConcurrentMode, useEffect } from 'react'

function WithSuspense() {
  const suspense = useFetch('https://example.com')

  useEffect(() => {
    suspense.read()
  }, [])

  if (!suspense.data) return null

  return <pre>{suspense.data}</pre>
}

function App() (
  <ConcurrentMode>
    <Suspense fallback="Loading...">
      <WithSuspense />
    </Suspense>
  </ConcurrentMode>
)
``` 
</details>

<details><summary><b>GraphQL with Suspense <sup><strong>(not implemented yet)</strong></sup></b></summary>
    
```jsx
const App = () => {
  const [todoTitle, setTodoTitle] = useState('')
  // if there's no <Provider /> used, useMutation works this way
  const mutation = useMutation('http://example.com', `
    mutation CreateTodo($todoTitle string) {
      todo(title: $todoTitle) {
        id
        title
      }
    }
  `)

  // ideally, I think it should be mutation.write({ todoTitle }) since mutation ~= POST
  const createTodo = () => mutation.read({ todoTitle })
  
  if (!request.data) return null

  return (
    <>
      <input onChange={e => setTodoTitle(e.target.value)} />
      <button onClick={createTodo}>Create Todo</button>
      <pre>{mutation.data}</pre>
    </>
  )
}
```
</details>


