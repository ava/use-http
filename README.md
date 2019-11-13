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
- Request/response interceptors <!--https://github.com/alex-cory/use-http#user-content-interceptors-->
- React Native support

Usage
-----

### Examples
  <ul>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-in-nextjs-nn9fm'>useFetch - Next.js</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/embed/km04k9k9x5'>useFetch - create-react-app</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-with-provider-c78w2'>useFetch + Provider</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-provider-requestresponse-interceptors-s1lex'>useFetch + Request/Response Interceptors + Provider</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/graphql-usequery-provider-uhdmj'>useQuery - GraphQL</a></li>
  </ul>

<details open><summary><b>Basic Usage (managed state) <code>useFetch</code></b></summary>

```js
import useFetch from 'use-http'

function Todos() {
  const [todos, setTodos] = useState([])

  const [request, response] = useFetch('https://example.com')

  // componentDidMount
  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current) return
    mounted.current= true
    initializeTodos()
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
      {todos.map(todo => (
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

  const { loading, error, data } = useFetch('https://example.com/todos', options)

  return (
    <>
      {error && 'Error!'}
      {loading && 'Loading...'}
      {data.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      )}
    </>
  )
}
```
</details>

<details open><summary><b>Basic Usage with <code>Provider</code></b></summary>

```js
import useFetch, { Provider } from 'use-http'

function Todos() {
  const { loading, error, data } = useFetch({
    onMount: true,
    path: '/todos',
    data: []
  })

  return (
    <>
      {error && 'Error!'}
      {loading && 'Loading...'}
      {data.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      )}
    </>
  )
}

const App = () => (
  <Provider url='https://example.com'>
    <Todos />
  </Provider>
)
```

[![Edit Basic Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/usefetch-with-provider-c78w2)

</details>

<details open><summary><b>Destructured <code>useFetch</code></b></summary>
    
⚠️ The `response` object cannot be destructured! (at least not currently) ️️⚠️
    
```js
var [request, response, loading, error] = useFetch('https://example.com')

// want to use object destructuring? You can do that too
var {
  request,
  // the `response` is everything you would expect to be in a normal response from an http request with the `data` field added.
  // ⚠️ The `response` object cannot be destructured! (at least not currently) ️️⚠️
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
[![Edit Basic Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/graphql-usequery-provider-uhdmj)

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


<details id='interceptors'><summary><b>Request/Response Interceptors</b></summary>
    
This example shows how we can do authentication in the `request` interceptor and how we can camelCase the results in the `response` interceptor
    
```jsx
import { Provider } from 'use-http'
import { toCamel } from 'convert-keys'

function App() {
  let [token] = useLocalStorage('token')
  
  const options = {
    interceptors: {
      // every time we make an http request, this will run 1st before the request is made
      request: async (options) => {
        if (isExpired(token)) token = await getNewToken()
        options.headers.Authorization = `Bearer ${token}`
        return options
      },
      // every time we make an http request, before getting the response back, this will run
      response: (response) => {
        // unfortunately, because this is a JS Response object, we have to modify it directly.
        // It shouldn't have any negative affect since this is getting reset on each request.
        // use "eslint-disable-next-line" if you're getting linting errors.
        if (response.data) response.data = toCamel(response.data)
        return response
      }
    }
  }
  
  return (
    <Provider url='http://example.com' options={options}>
      <SomeComponent />
    <Provider/>
  )
}

```
[![Edit Basic Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/usefetch-provider-requestresponse-interceptors-s1lex)
</details>

<details id='form-data'><summary><b>File Uploads (FormData)</b></summary>
    
This example shows how we can upload a file using `useFetch`.
    
```jsx
import useFetch from 'use-http'

const FileUploader = () => {
  const [file, setFile] = useState()
  
  const { post } = useFetch('https://example.com/upload')

  const uploadFile = async () => {
    const data = new FormData()
    data.append('file', file)
    if (file instanceof FormData) await post(data)
  }

  return (
    <div>
      {/* Drop a file onto the input below */}
      <input onChange={e => setFile(e.target.files[0])} />
      <button onClick={uploadFile}>Upload</button>
    </div>
  )
}
```
</details>

<details><summary><b>Handling Different Response Types</b></summary>
    
This example shows how we can get `.json()`, `.text()`, `.formData()`, `.blob()`, `.arrayBuffer()`, and all the other [http response methods](https://developer.mozilla.org/en-US/docs/Web/API/Response#Methods). By default, `useFetch` 1st tries to call `response.json()` under the hood, if that fails it's backup is `response.text()`. If that fails, then you need a different response type which is where this comes in.

```js
import useFetch from 'use-http'

const App = () => {
  const [name, setName] = useState('')
  
  const { get, loading, error, response } = useFetch('http://example.com')

  const handleClick = async () => {
    await get('/users/1?name=true') // will return just the user's name
    const text = await response.text()
    setName(text)
  }
  
  return (
    <>
      <button onClick={handleClick}>Load Data</button>
      {error && error.messge}
      {loading && "Loading..."}
      {name && <div>{name}</div>}
    </>
  )
}
```
[![Edit Basic Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/usefetch-different-response-types-c6csw)

</details>

<details><summary><b>Overwrite/Remove Options/Headers Set in Provider</b></summary>
    
This example shows how to remove a header all together. Let's say you have `<Provider url='url.com' options={{ headers: { Authentication: 'Bearer MY_TOKEN' } }}><App /></Provider>`, but for one api call, you don't want that header in your `useFetch` at all for one instance in your app. This would allow you to remove that.

```js
import useFetch from 'use-http'

const Todos = () => {
  // let's say for this request, you don't want the `Accept` header at all
  const { loading, error, data: todos } = useFetch(globalOptions => {
    delete globalOptions.headers.Accept
    return {
      onMount: true,
      data: [],
      ...globalOptions
    }
  })
  
  // can also do this and overwrite the url like this
  // const { loading, error, data: todos } = useFetch('https://my-new-url.com', globalOptions => {
  
  return (
    <>
      {error && error.messge}
      {loading && "Loading..."}
      {todos && <ul>{todos.map(todo => <li key={todo.id}>{todo.title}</li>)}</ul>}
    </>
  )
}

const App = () => {
  const options = {
    headers: {
      Accept: 'application/json'
    }
  }
  return (
    <Provider url='https://url.com' options={options}><Todos /></Provider>
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
    
This is exactly what you would pass to the normal js `fetch`, with a little extra. All these options can be passed to the `<Provider options={/* every option below */} />`, or directly to `useFetch`. If you have both in the `<Provider />` and in `useFetch`, the `useFetch` options will overwrite the ones from the `<Provider />`

| Option                | Description                                                               |  Default     |
| --------------------- | --------------------------------------------------------------------------|------------- |
| `url` | Allows you to set a base path so relative paths can be used for each request :)       | empty string |
| `onMount` | Once the component mounts, the http request will run immediately | `false` |
| `onUpdate` | This is essentially the same as the dependency array for useEffect. Whenever one of the variables in this array is updated, the http request will re-run. | `[]` |
| `onAbort` | Runs when the request is aborted. | empty function |
| `onTimeout` | Called when the request times out. | empty function |
| `retries` | When a request fails or times out, retry the request this many times. By default it will not retry.    | `0` |
| `timeout` | The request will be aborted/cancelled after this amount of time. This is also the interval at which `retries` will be made at. **in milliseconds**       | `30000` </br> (30 seconds) |
| `data` | Allows you to set a default value for `data`       | `undefined` |
| `loading` | Allows you to set default value for `loading`       | `false` unless `onMount === true` |
| `interceptors.request` | Allows you to do something before an http request is sent out. Useful for authentication if you need to refresh tokens a lot.  | `undefined` |
| `interceptors.response` | Allows you to do something after an http response is recieved. Useful for something like camelCasing the keys of the response.  | `undefined` |

```jsx
useFetch({
  // accepts all `fetch` options such as headers, method, etc.
  url: 'https://example.com',     // used to be `baseUrl`
  onMount: true,
  onUpdate: []                    // everytime a variable in this array is updated, it will re-run the request (GET by default)
  onTimeout: () => {},            // called when the request times out
  onAbort: () => {},              // called when aborting the request
  retries: 3,                     // amount of times it should retry before erroring out
  timeout: 10000,                 // amount of time before the request (or request(s) for retries) errors out.
  data: [],                       // default for `data` field
  loading: false,                 // default for `loading` field
  interceptors: {                 // typically, `interceptors` would be added as an option to the `<Provider />`
    request: async (options) => { // `async` is not required
      return options              // returning the `options` is important
    },
    response: (response) => {
      return response             // returning the `response` is important
    }
  }
})
```

Sponsors
--------

Does your company use use-http? Consider sponsoring the project to fund new features, bug fixes, and more.

<a href="https://ava.inc" style="margin-right: 2rem;" target="_blank"><img width="280px" src="https://ava.inc/ava-logo-green.png" /></a>


Feature Requests/Ideas
----------------------
If you have feature requests, let's talk about them in [this issue](https://github.com/alex-cory/use-http/issues/13)!

Todos
------
 - [ ] maybe add translations [like this one](https://github.com/jamiebuilds/unstated-next)
 - [ ] add browser support to docs [1](https://github.com/godban/browsers-support-badges) [2](https://gist.github.com/danbovey/b468c2f810ae8efe09cb5a6fac3eaee5) (currently does not support ie 11)
 - [ ] maybe add contributors [all-contributors](https://github.com/all-contributors/all-contributors)
 - [ ] add sponsers [similar to this](https://github.com/carbon-app/carbon)
 - [ ] tests
   - [ ] tests for SSR
   - [ ] tests for FormData (can also do it for react-native at same time. [see here](https://stackoverflow.com/questions/45842088/react-native-mocking-formdata-in-unit-tests))
   - [ ] tests for GraphQL hooks `useMutation` + `useQuery`
   - [ ] tests for stale `response` see this [PR](https://github.com/alex-cory/use-http/pull/119/files)
   - [ ] tests to make sure `response.formData()` and some of the other http `response methods` work properly
 - [ ] take a look at how [react-apollo-hooks](https://github.com/trojanowski/react-apollo-hooks) work. Maybe ad `useSubscription` and `const request = useFetch(); request.subscribe()` or something along those lines
 - [ ] make this a github package
 - [ ] Make work with React Suspense [current example WIP](https://codesandbox.io/s/7ww5950no0)
 - [ ] get it all working on a SSR codesandbox, this way we can have api to call locally
 - [ ] make GraphQL work with React Suspense
 - [ ] make GraphQL examples in codesandbox
 - [ ] Documentation:
     - [ ] show comparison with Apollo
       - [ ] figure out a good way to show side-by-side comparisonsf
     - [ ] show comparison with Axios
     - [ ] how this cancels a request on unmount of a component to avoid the error "cannot update state during a state transition" or something like that due to an incomplete http request
 - [ ] Dedupe requests done to the same endpoint. Only one request to the same endpoint will be initiated. [ref](https://www.npmjs.com/package/@bjornagh/use-fetch)
 - [ ] Cache responses to improve speed and reduce amount of requests
 - [ ] maybe add syntax for middle helpers for inline `headers` or `queries` like this:
```jsx
  const request = useFetch('https://example.com')
  
  request
    .headers({
      auth: jwt      // this would inline add the `auth` header
    })
    .query({         // might have to use .params({ }) since we're using .query() for GraphQL
      no: 'way'      // this would inline make the url: https://example.com?no=way
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
  - [ ] potential option ideas
  ```jsx
  const request = useFetch({
    onSuccess: (/* idk what to put here */) => {},
    onError: (error) => {},
    
    // can retry on certain http status codes
    retryOn: [503],
    // OR
    retryOn(attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        return true;
      }
    },
    
    // This function receives a retryAttempt integer and returns the delay to apply before the next attempt in milliseconds
    retryDelay(attempt, error, response) {
      // applies exponential backoff
      return Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)
      // applies linear backoff
      return attempt * 1000
    },
    
    // these will be the exact same ones as Apollo's
    // this will eventually default to 'cache-first'
    cachePolicy: 'cache-first', // 'cache-first', 'cache-and-network', 'network-only', 'cache-only', 'no-cache'
    
    // The time in milliseconds that cache data remains fresh.
    // After a successful cache update, that cache data will become stale after this duration
    cacheTime: 10000,
    
    // The time in milliseconds that unused/inactive cache data remains in memory.
    // When a query's cache becomes unused or inactive, that cache data will be garbage collected after this duration.
    invalidateCacheTime: 10000,
    
    // potential idea to fetch on server instead of just having `loading` state. Not sure if this is a good idea though
    onServer: true,
    
    // if you would prefer to pass the query in the config
    query: `some graphql query`
    
    // if you would prefer to pass the mutation in the config
    mutation: `some graphql mutation`
    
    // enabled React Suspense mode
    suspense: false,
    
    retryOnError: false,
    
    refreshWhenHidden: false,
  })
  ```
   - resources
     - [retryOn/retryDelay (fetch-retry)](https://www.npmjs.com/package/fetch-retry#example-retry-on-503-service-unavailable)
     - [retryDelay (react-query)](https://github.com/tannerlinsley/react-query)
     - [zeit's swr](https://github.com/zeit/swr)
      
  - [ ] potential option ideas for `GraphQL`
  ```jsx
  const request = useQuery({ onMount: true })`your graphql query`
  
  const request = useFetch(...)
  const userID = 'some-user-uuid'
  const res = await request.query({ userID })`
    query Todos($userID string!) {
      todos(userID: $userID) {
        id
        title
      }
    }
  `
  ```
  - [ ] make code editor plugin/package/extension that adds GraphQL syntax highlighting for `useQuery` and `useMutation` 😊

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


