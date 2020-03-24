![use-http logo][3]

<p align="center">
    <h1 align="center">useFetch</h1>
</p>
<p align="center">🐶 React hook for making isomorphic http requests</p>
<p align="center">
    <a href="https://github.com/alex-cory/use-http/pulls">
      <img src="https://camo.githubusercontent.com/d4e0f63e9613ee474a7dfdc23c240b9795712c96/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e737667" />
    </a>
    <a href="https://circleci.com/gh/alex-cory/use-http">
      <img src="https://img.shields.io/circleci/project/github/alex-cory/use-http/master.svg" />
    </a>
    <a href="https://www.npmtrends.com/use-http">
      <img src="https://img.shields.io/npm/dm/use-http.svg" />
    </a>
    <a href="https://lgtm.com/projects/g/alex-cory/use-http/context:javascript">
      <img alt="undefined" src="https://img.shields.io/lgtm/grade/javascript/g/alex-cory/use-http.svg?logo=lgtm&logoWidth=18"/>
    </a>
    <a href="https://bundlephobia.com/result?p=use-http">
      <img alt="undefined" src="https://img.shields.io/bundlephobia/minzip/use-http.svg">
    </a>
    <a href="https://snyk.io/test/github/alex-cory/use-http?targetFile=package.json">
      <img src="https://snyk.io/test/github/alex-cory/use-http/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/alex-cory/use-http?targetFile=package.json" style="max-width:100%;">
    </a>
    <a href="https://www.npmjs.com/package/use-http">
      <img src="https://img.shields.io/npm/v/use-http.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/alex-cory/use-http?targetFile=package.json" style="max-width:100%;">
    </a>
    <a href="https://github.com/alex-cory/use-http/blob/master/license.md">
      <img alt="undefined" src="https://img.shields.io/github/license/alex-cory/use-http.svg">
    </a>
    <a href="https://greenkeeper.io/">
      <img alt="undefined" src="https://badges.greenkeeper.io/alex-cory/use-http.svg">
    </a>
    <a href="https://standardjs.com">
        <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" />
    </a>

</p>

<img align="right" src="https://media.giphy.com/media/fAFg3xESCJyw/giphy.gif" />
<p>
Need to fetch some data? Try this one out. It's an isomorphic fetch hook. That means it works with SSR (server side rendering).
</p>
<br />
<p>
A note on the documentation below. Many of these examples could have performance improvements using <code>useMemo</code> and <code>useCallback</code>, but for the sake of the beginner/ease of reading, they are left out.
</p>

Features
=========

- SSR (server side rendering) support
- TypeScript support
- 1 dependency ([use-ssr](https://github.com/alex-cory/use-ssr))
- GraphQL support (queries + mutations)
- Provider to set default `url` and `options`
- Request/response interceptors <!--https://github.com/alex-cory/use-http#user-content-interceptors-->
- React Native support
- Aborts/Cancels pending http requests when a component unmounts
- Built in caching
- Persistent caching support
- Suspense<sup>(experimental)</sup> support

Examples
=========

- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-in-nextjs-nn9fm'>useFetch + Next.js</a>
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/embed/km04k9k9x5'>useFetch + create-react-app</a>
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-with-provider-c78w2'>useFetch + Provider</a>
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-suspense-i22wv'>useFetch + Suspense</a>
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-provider-pagination-exttg'>useFetch + Pagination + Provider</a>
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-provider-requestresponse-interceptors-s1lex'>useFetch + Request/Response Interceptors + Provider</a>
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/graphql-usequery-provider-uhdmj'>useQuery - GraphQL</a>

Installation
=============

```shell
yarn add use-http    or    npm i -S use-http
```

<div align="center">
  <br>
  <br>
  <hr>
  <p>
    <sup>
      <a href="https://github.com/sponsors/alex-cory">Consider sponsoring</a>
    </sup>
    <br>
    <br>
    <a href="https://ava.inc">
      <img src="https://github.com/alex-cory/use-http/raw/master/public/ava-logo.png" width="130" alt="Ava">
    </a>
    <br>
    <sub><b>Ava, Rapid Application Development</b></sub>
    <br>
    <sub>
    Need a freelance software engineer with more than 5 years production experience at companies like Facebook, Discord, Best Buy, and Citrix?</br>
    <a href="https://ava.inc">website</a> | <a href="https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=alex@ava.inc">email</a> | <a href="https://twitter.com/@alexcory_">twitter</a>
    </sub>
  </p>
  <hr>
  <br>
  <br>
</div>

Usage
=============

Basic Usage (auto managed state)
-------------------

This fetch is run `onMount/componentDidMount`. The last argument `[]` means it will run `onMount`. If you pass it a variable like `[someVariable]`, it will run `onMount` and again whenever `someVariable` changes values (aka `onUpdate`). **If no method is specified, GET is the default**

```js
import useFetch from 'use-http'

function Todos() {
  const options = { // accepts all `fetch` options
    data: []        // default for `data` will be an array instead of undefined
  }

  const { loading, error, data } = useFetch('https://example.com/todos', options, []) // onMount (GET by default)

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

Managed State Usage
-------------------

If the last argument of `useFetch` is not a dependency array `[]`, then it will not fire until you call one of the http methods like `get`, `post`, etc.

```js
import useFetch from 'use-http'

function Todos() {
  const [todos, setTodos] = useState([])

  const [request, response] = useFetch('https://example.com')

  // componentDidMount
  useEffect(() => {
    initializeTodos()
  }, [])
  
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

Basic Usage With Provider (auto managed state)
---------------------------------------------

```js
import useFetch, { Provider } from 'use-http'

function Todos() {
  const { loading, error, data } = useFetch({
    path: '/todos',
    data: []        // default for `data` will be an array instead of undefined
  }, [])            // onMount

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

Suspense Mode (auto managed state)
----------------------------------

```js
import useFetch, { Provider } from 'use-http'

function Todos() {
  const { data: todos } = useFetch({
    path: '/todos',
    data: [],
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount
  
  return todos.map(todo => <div key={todo.id}>{todo.title}</div>)
}

function App() {
  const options = {
    suspense: true
  }
  return (
    <Provider url='https://example.com' options={options}>
      <Suspense fallback='Loading...'>
        <Todos />
      </Suspense>
    </Provider>
  )
}
```

[![Edit Basic Example](https://codesandbox.io/static/img/play-codesandbox.svg)]()

Suspense Mode (managed state)
-----------------------------

Can put `suspense` in 2 places. Either `useFetch` (A) or `Provider` (B).

```js
import useFetch, { Provider } from 'use-http'

function Todos() {
  const [todos, setTodos] = useState([])
  // A. can put `suspense: true` here
  const { get, response } = useFetch({ data: [], suspense: true })

  const loadInitialTodos = async () => {
    const todos = await get('/todos')
    if (response.ok) setTodos(todos)
  }

  // componentDidMount
  useEffect(() => {
    loadInitialTodos()
  }, [])

  
  return todos.map(todo => <div key={todo.id}>{todo.title}</div>)
}

function App() {
  const options = {
    suspense: true // B. can put `suspense: true` here too
  }
  return (
    <Provider url='https://example.com' options={options}>
      <Suspense fallback='Loading...'>
        <Todos />
      </Suspense>
    </Provider>
  )
}
```

[![Edit Basic Example](https://codesandbox.io/static/img/play-codesandbox.svg)]()

Pagination With Provider
---------------------------

The `onNewData` will take the current data, and the newly fetched data, and allow you to merge the two however you choose. In the example below, we are appending the new todos to the end of the current todos.

```js
import useFetch, { Provider } from 'use-http'

const Todos = () => {
  const [page, setPage] = useState(1)

  const { data, loading } = useFetch({
    path: `/todos?page=${page}&amountPerPage=15`,
    onNewData: (currTodos, newTodos) => [...currTodos, ...newTodos], // appends newly fetched todos
    perPage: 15, // stops making more requests if last todos fetched < 15
    data: []
  }, [page]) // runs onMount AND whenever the `page` updates (onUpdate)

  return (
    <ul>
      {data.map(todo => <li key={todo.id}>{todo.title}</li>}
      {loading && 'Loading...'}
      {!loading && (
        <button onClick={() => setPage(page + 1)}>Load More Todos</button>
      )}
    </ul>
  )
}

const App = () => (
  <Provider url='https://example.com'>
    <Todos />
  </Provider>
)
```

[![Edit Basic Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/usefetch-provider-pagination-exttg)

Destructured
-------------

⚠️ Do not destructure the `response` object! Technically you can do it, but if you need to access the `response.ok` from, for example, within a component's onClick handler, it will be a stale value for `ok` where it will be correct for `response.ok`.  ️️⚠️

```js
var [request, response, loading, error] = useFetch('https://example.com')

// want to use object destructuring? You can do that too
var {
  request,
  response, // 🚨 Do not destructure the `response` object!
  loading,
  error,
  data,
  cache,   // .has(), .clear(), .delete(), .get(), .set()    (similar to JS Map)
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

// 🚨 Do not destructure the `response` object!
// 🚨 This just shows what fields are available in it.
var {
  ok,
  status,
  headers,
  data,
  type,
  statusText,
  url,
  body,
  bodyUsed,
  redirected,
  // methods
  json,
  text,
  formData,
  blob,
  arrayBuffer,
  clone
} = response

var {
  loading,
  error,
  data,
  cache,   // .has(), .clear(), .delete(), .get(), .set()    (similar to JS Map)
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

Relative routes
---------------

⚠️ `baseUrl` is no longer supported, it is now only `url`

```js
var request = useFetch({ url: 'https://example.com' })
// OR
var request = useFetch('https://example.com')

request.post('/todos', {
  no: 'way'
})
```

Abort
-----

<img src="https://raw.githubusercontent.com/alex-cory/use-http/master/public/abort-example-1.gif" height="250" />

```js
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

Request/Response Interceptors with `Provider`
---------------------------------------------

This example shows how we can do authentication in the `request` interceptor and how we can camelCase the results in the `response` interceptor

```js
import { Provider } from 'use-http'
import { toCamel } from 'convert-keys'

function App() {
  let [token, setToken] = useLocalStorage('token')
  
  const options = {
    interceptors: {
      // every time we make an http request, this will run 1st before the request is made
      // url, path and route are supplied to the interceptor
      // request options can be modified and must be returned
      request: async (options, url, path, route) => {
        if (isExpired(token)) {
          token = await getNewToken()
          setToken(token)
        }
        options.headers.Authorization = `Bearer ${token}`
        return options
      },
      // every time we make an http request, before getting the response back, this will run
      response: async (response) => {
        const res = response
        if (res.data) res.data = toCamel(res.data)
        return res
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

File Upload (FormData)
----------------------

This example shows how we can upload a file using `useFetch`.

```js
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

Handling Different Response Types
---------------------------------
    
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

Overwrite/Remove Options/Headers Set in Provider
------------------------------------------------

This example shows how to remove a header all together. Let's say you have `<Provider url='url.com' options={{ headers: { Authentication: 'Bearer MY_TOKEN' } }}><App /></Provider>`, but for one api call, you don't want that header in your `useFetch` at all for one instance in your app. This would allow you to remove that.

```js
import useFetch from 'use-http'

const Todos = () => {
  // let's say for this request, you don't want the `Accept` header at all
  const { loading, error, data: todos } = useFetch(globalOptions => {
    delete globalOptions.headers.Accept
    return {
      data: [],
      ...globalOptions
    }
  }, []) // onMount
  
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

GraphQL Query
---------------

```js

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

GraphQL Mutation
-----------------

```js

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

`Provider` + `useMutation` and `useQuery`
=========================================

The `Provider` allows us to set a default `url`, `options` (such as headers) and so on.

useQuery (query for todos)
--------------------------

```js
import { Provider, useQuery, useMutation } from 'use-http'

function QueryComponent() {
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

useMutation (add a new todo)
-------------------

```js
function MutationComponent() {
  const [todoTitle, setTodoTitle] = useState('')
  
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

Adding the Provider
-------------------

These props are defaults used in every request inside the `<Provider />`. They can be overwritten individually

```js
function App() {

  const options = {
    headers: {
      Authorization: 'Bearer jwt-asdfasdfasdf'
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

Hooks
=======

| Option                | Description                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `useFetch` | The base hook |
| `useQuery` | For making a GraphQL query |
| `useMutation` | For making a GraphQL mutation |

Options
========

This is exactly what you would pass to the normal js `fetch`, with a little extra. All these options can be passed to the `<Provider options={/* every option below */} />`, or directly to `useFetch`. If you have both in the `<Provider />` and in `useFetch`, the `useFetch` options will overwrite the ones from the `<Provider />`

| Option                | Description                                                               |  Default     |
| --------------------- | --------------------------------------------------------------------------|------------- |
| `suspense` | Enables React Suspense mode. [example](https://codesandbox.io/s/usefetch-suspense-i22wv) | false |
| `cachePolicy` | These will be the same ones as Apollo's [fetch policies](https://www.apollographql.com/docs/react/api/react-apollo/#optionsfetchpolicy). Possible values are `cache-and-network`, `network-only`, `cache-only`, `no-cache`, `cache-first`. Currently only supports **`cache-first`**  or **`no-cache`**      | `cache-first` |
| `cacheLife` | After a successful cache update, that cache data will become stale after this duration       | `0` |
| `url` | Allows you to set a base path so relative paths can be used for each request :)       | empty string |
| `onNewData` | Merges the current data with the incoming data. Great for pagination.  | `(curr, new) => new` |
| `perPage` | Stops making more requests if there is no more data to fetch. (i.e. if we have 25 todos, and the perPage is 10, after fetching 2 times, we will have 20 todos. The last 5 tells us we don't have any more to fetch because it's less than 10) For pagination. | `0` |
| `onAbort` | Runs when the request is aborted. | empty function |
| `onTimeout` | Called when the request times out. | empty function |
| `retries` | When a request fails or times out, retry the request this many times. By default it will not retry.    | `0` |
| `timeout` | The request will be aborted/cancelled after this amount of time. This is also the interval at which `retries` will be made at. **in milliseconds**       | `30000` </br> (30 seconds) |
| `data` | Allows you to set a default value for `data`       | `undefined` |
| `loading` | Allows you to set default value for `loading`       | `false` unless the last argument of `useFetch` is `[]` |
| `interceptors.request` | Allows you to do something before an http request is sent out. Useful for authentication if you need to refresh tokens a lot.  | `undefined` |
| `interceptors.response` | Allows you to do something after an http response is recieved. Useful for something like camelCasing the keys of the response.  | `undefined` |
| `persist` | Persists data for the duration of `cacheLife`. If `cacheLife` is not set it defaults to 24h. Currently only available in Browser. | `false` |

```jsx
const options = {
  // accepts all `fetch` options such as headers, method, etc.
  
  // enables React Suspense mode
  suspense: true, // defaults to `false`

  // Cache responses to improve speed and reduce amount of requests
  // Only one request to the same endpoint will be initiated unless cacheLife expires for 'cache-first'.
  cachePolicy: 'cache-first' // 'no-cache'

  // The time in milliseconds that cache data remains fresh.
  cacheLife: 0,

  // Allows caching to persist after page refresh. Only supported in the Browser currently.
  persist: false,

  // used to be `baseUrl`. You can set your URL this way instead of as the 1st argument
  url: 'https://example.com',
  
  // called when the request times out
  onTimeout: () => {},
  
  // called when aborting the request
  onAbort: () => {},
  
  // this will allow you to merge the data however you choose. Used for Pagination
  onNewData: (currData, newData) => {
    return [...currData, ...newData] 
  },
  
  // this will tell useFetch not to run the request if the list doesn't haveMore. (pagination)
  // i.e. if the last page fetched was < 15, don't run the request again
  perPage: 15,

  // amount of times it should retry before erroring out
  retries: 3,
  
  // amount of time before the request (or request(s) for each retry) errors out.
  timeout: 10000,
  
  // set's the default for the `data` field
  data: [],
  
  // set's the default for `loading` field
  loading: false,
  
  // typically, `interceptors` would be added as an option to the `<Provider />`
  interceptors: {
    request: async (options, url, path, route) => { // `async` is not required
      return options // returning the `options` is important
    },
    response: async (response) => { // `async` is not required
      // note: `response.data` is equivalent to `await response.json()`
      return response // returning the `response` is important
    }
  }
}

useFetch(options)
// OR
<Provider options={options}><ResOfYourApp /></Provider>
```

Who's using use-http?
=====================

<div style="display: flex; align-items: center; justify-content: center;">
  <a href="https://ava.inc">
    <img height="140px" src="https://github.com/alex-cory/use-http/raw/master/public/ava-logo.png" />
  </a>
  <a href="https://github.com/microsoft/DLWorkspace">
    <img height="140px" src="https://github.com/alex-cory/use-http/raw/master/public/microsoft-logo.png" />
  </a>
  <a href="https://github.com/mozilla/Spoke">
    <img height="140px" src="https://github.com/alex-cory/use-http/raw/master/public/mozilla.png" />
  </a>
  <a href="https://beapte.com">
    <img height="140px" src="https://github.com/alex-cory/use-http/raw/master/public/apte-logo.png" />
  </a>
</div>

Browser Support
===============

If you need support for IE, you will need to add additional polyfills.  The React docs suggest [these polyfills][4], but from [this issue][2] we have found it to work fine with the [`react-app-polyfill`]. If you have any updates to this browser list, please submit a PR!

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />]()<br/>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />]()<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />]()<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />]()<br/>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />]()<br/>Opera |
| --------- | --------- | --------- | --------- | --------- |
| 12+ | last 2 versions| last 2 versions| last 2 versions| last 2 versions |

Feature Requests/Ideas
======================

If you have feature requests, [submit an issue][1] to let us know what you would like to see!

<!--

Mutations with Suspense <sup>(Not Implemented Yet)</sup>
==================
```js
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

-->

[1]: https://github.com/alex-cory/use-http/issues/new?title=[Feature%20Request]%20YOUR_FEATURE_NAME
[2]: https://github.com/alex-cory/use-http/issues/93#issuecomment-600896722
[3]: https://github.com/alex-cory/use-http/raw/master/public/dog.png
[4]: https://reactjs.org/docs/javascript-environment-requirements.html
[`react-app-polyfill`]: https://www.npmjs.com/package/react-app-polyfill