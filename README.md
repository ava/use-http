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
    <a href="http://packagequality.com/#?package=use-http">
      <img src="https://npm.packagequality.com/shield/use-http.svg" />
    </a>
    <a href="https://standardjs.com">
      <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" />
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
- Aborts/Cancels pending http requests when a component unmounts
- Built in caching
- Suspense<sup>(experimental)</sup> support

Usage
-----

### Examples
  <ul>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-in-nextjs-nn9fm'>useFetch - Next.js</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/embed/km04k9k9x5'>useFetch - create-react-app</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-with-provider-c78w2'>useFetch + Provider</a></li>
<li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-provider-pagination-exttg'>useFetch + Pagination + Provider</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/usefetch-provider-requestresponse-interceptors-s1lex'>useFetch + Request/Response Interceptors + Provider</a></li>
    <li><a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/graphql-usequery-provider-uhdmj'>useQuery - GraphQL</a></li>
  </ul>

<details open><summary><b>Basic Usage (managed state) <code>useFetch</code></b></summary>

If the last argument of `useFetch` is not a dependency array `[]`, then it will not fire until you call one of the http methods like `get`, `post`, etc.

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

<details><summary><b>Basic Usage (auto managed state) <code>useFetch</code></b></summary>

This fetch is run `onMount/componentDidMount`. The last argument `[]` means it will run `onMount`. If you pass it a variable like `[someVariable]`, it will run `onMount` and again whenever `someVariable` changes values (aka `onUpdate`). **If no method is specified, GET is the default**

```js
import useFetch from 'use-http'

function Todos() {
  // accepts all `fetch` options
  const options = {
    data: [],       // setting default for `data` as array instead of undefined
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
</details>

<details open><summary><b>Suspense Mode (auto managed state)</b></summary>

```js
import useFetch, { Provider } from 'use-http'

function Todos() {
  const { error, data: todos } = useFetch({
    path: '/todos',
    data: [],
    suspense: true // can put it in 2 places. Here or in Provider
  }, []) // onMount

  return (
    <>
      {error && 'Error!'}
      {todos.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      )}
    </>
  )
}

const App = () => (
  const options = {
    suspense: true
  }
  <Provider url='https://example.com' options={options}>
    <Suspense fallback='Loading...'>
      <Todos />
    </Suspense>
  </Provider>
)
```

[![Edit Basic Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/usefetch-with-provider-c78w2)

</details>

<details open><summary><b>Suspense Mode (managed state) flag</b></summary>

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

  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    loadInitialTodos()
  }, [])

  return (
    <Fragment>
      {error && 'Error!'}
      {todos.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      )}
    </Fragment>
  )
}

const App = () => (
  const options = {
    suspense: true // B. can put `suspense: true` here too
  }
  <Provider url='https://example.com' options={options}>
    <Suspense fallback='Loading...'>
      <Todos />
    </Suspense>
  </Provider>
)
```

[![Edit Basic Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/usefetch-with-provider-c78w2)

</details>

<details open><summary><b>Suspense Mode (managed state) .read()</b></summary>

Here the `.read()` will perform a `GET` request unless the `method` option is set in `useFetch`.

```js
import useFetch, { Provider } from 'use-http'

function Todos() {
  const [todos, setTodos] = useState([])
  const [request, response] = useFetch({ data: [] })

  const loadInitialTodos = async () => {
    // this .read() set's suspense mode to true. Defaults to GET request
    const todos = await request.read('/todos')
    if (response.ok) setTodos(todos)
  }

  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    loadInitialTodos()
  }, [])

  return (
    <>
      {error && 'Error!'}
      {todos.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      )}
    </>
  )
}

const App = () => (
  <Provider url='https://example.com'>
    <Suspense fallback='Loading...'>
      <Todos />
    </Suspense>
  </Provider>
)
```

<details open><summary><b>Basic Usage (auto managed state) with <code>Provider</code></b></summary>

```js
import useFetch, { Provider } from 'use-http'

function Todos() {
  const { loading, error, data } = useFetch({
    path: '/todos',
    data: []
  }, []) // onMount

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
      <img src="public/ava-logo.png" width="130" alt="Ava">
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
  <br>
</div>

<details open><summary><b>Pagination + <code>Provider</code></b></summary>

The `onNewData` will take the current data, and the newly fetched data, and allow you to merge the two however you choose. In the example below, we are appending the new todos to the end of the current todos.

```jsx
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

</details>

<details open><summary><b>Destructured <code>useFetch</code></b></summary>

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
  read,     // suspense (experimental)
  get,
  post,
  put,
  patch,
  delete    // don't destructure `delete` though, it's a keyword
  del,      // <- that's why we have this (del). or use `request.delete`
  mutate,   // GraphQL
  query,    // GraphQL
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
  read,   // suspense (experimental)
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
| `suspense` | Enables React Suspense mode. [example]() | false |
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
      return options              // returning the `options` is important
    },
    response: (response) => {
      return response             // returning the `response` is important
    }
  }
}

useFetch(options)
// OR
<Provider options={options}><ResOfYourApp /></Provider>
```

Who's using use-http?
----------------------

Does your company use use-http? Consider sponsoring the project to fund new features, bug fixes, and more.

<p align="center">
  <a href="https://ava.inc" style="margin-right: 2rem;" target="_blank">
    <img width="110px" src="https://ava.inc/ava-logo-green.png" />
  </a>
  <a href="https://github.com/microsoft/DLWorkspace">
    <img height="110px" src="https://github.com/alex-cory/use-http/raw/master/public/microsoft-logo.png" />
  </a>
  <a href="https://github.com/mozilla/Spoke">
    <img height="110px" src="https://github.com/alex-cory/use-http/raw/master/public/mozilla.png" />
  </a>
</p>

Feature Requests/Ideas
----------------------

If you have feature requests, let's talk about them in [this issue](https://github.com/alex-cory/use-http/issues/13)!

Todos
------

- [ ] maybe add translations [like this one](https://github.com/jamiebuilds/unstated-next)
- [ ] add browser support to docs [1](https://github.com/godban/browsers-support-badges) [2](https://gist.github.com/danbovey/b468c2f810ae8efe09cb5a6fac3eaee5) (currently does not support ie 11)
- [ ] maybe add contributors [all-contributors](https://github.com/all-contributors/all-contributors)
- [ ] add sponsors [similar to this](https://github.com/carbon-app/carbon)
- [ ] tests
  - [ ] doFetchArgs tests for `response.isExpired`
  - [ ] tests for SSR
  - [ ] tests for FormData (can also do it for react-native at same time. [see here](https://stackoverflow.com/questions/45842088/react-native-mocking-formdata-in-unit-tests))
  - [ ] tests for GraphQL hooks `useMutation` + `useQuery`
  - [ ] tests for stale `response` see this [PR](https://github.com/alex-cory/use-http/pull/119/files)
  - [ ] tests to make sure `response.formData()` and some of the other http `response methods` work properly
  - [ ] aborts fetch on unmount
- [ ] take a look at how [react-apollo-hooks](https://github.com/trojanowski/react-apollo-hooks) work. Maybe ad `useSubscription` and `const request = useFetch(); request.subscribe()` or something along those lines
- [ ] make this a github package
- [ ] Make work with React Suspense [current example WIP](https://codesandbox.io/s/7ww5950no0)
- [ ] get it all working on a SSR codesandbox, this way we can have api to call locally
- [ ] make GraphQL work with React Suspense
- [ ] make GraphQL examples in codesandbox
- [ ] Documentation:
  - [ ] show comparison with Apollo
  - [ ] figure out a good way to show side-by-side comparisons
  - [ ] show comparison with Axios
  - [ ] how this cancels a request on unmount of a component to avoid the error "cannot update state during a state transition" or something like that due to an incomplete http request
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
    // allows caching to persist after page refresh
    persist: true, // false by default
    // Allows you to pass in your own cache to useFetch
    // This is controversial though because `cache` is an option in the requestInit
    // and it's value is a string. See: https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
    // One possible solution is to move the default `fetch`'s `cache` to `cachePolicy`.
    // I don't really like this solution though.
    // Another solution is to only allow the `cache` option with the `<Provider cache={new Map()} />`
    cache: new Map(),
    interceptors: {
      // I think it's more scalable/clean to have this as an object.
      // What if we only need the `route` and `options`?
      request: async ({ options, url, path, route }) => {},
      response: ({ response }) => {}
    },
    // can retry on certain http status codes
    retryOn: [503],
    // OR
    retryOn({ attempt, error, response }) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        return true;
      }
    },
    // This function receives a retryAttempt integer and returns the delay to apply before the next attempt in milliseconds
    retryDelay({ attempt, error, response }) {
      // applies exponential backoff
      return Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)
      // applies linear backoff
      return attempt * 1000
    },
    // these will be the exact same ones as Apollo's
    cachePolicy: 'cache-and-network', 'network-only', 'cache-only', 'no-cache' // 'cache-first'
    // potential idea to fetch on server instead of just having `loading` state. Not sure if this is a good idea though
    onServer: true,
    onSuccess: (/* idk what to put here */) => {},
    onError: (error) => {},
    // if you would prefer to pass the query in the config
    query: `some graphql query`
    // if you would prefer to pass the mutation in the config
    mutation: `some graphql mutation`
    retryOnError: false,
    refreshWhenHidden: false,
  })
  ```

- resources
  - [retryOn/retryDelay (fetch-retry)](https://www.npmjs.com/package/fetch-retry#example-retry-on-503-service-unavailable)
  - [retryDelay (react-query)](https://github.com/tannerlinsley/react-query)

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
