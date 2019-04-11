<h1 align="center">useFetch</h1>
<p align="center">🐶 A React hook for making http requests</p>
<p align="center">
    <a href="https://github.com/alex-cory/react-useportal/pulls">
      <img src="https://camo.githubusercontent.com/d4e0f63e9613ee474a7dfdc23c240b9795712c96/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e737667" />
    </a>
</p>

Need to fetch some data? Try this one out.

### Examples
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/embed/km04k9k9x5'>Code Sandbox Example</a>


Installation
------------

```shell
yarn add react-usefetcher
```

Usage
-----

### Stateless
```jsx 
import useFetch from 'react-usefetch'

function App() {
  const [data, loading, error] = useFetch('https://example.com')
  return error ? (
    'Error!'
  ) : loading ? (
    'Loading!'
  ) : (
    <code>
      <pre>{data}</pre>
    </code>
  )
}
```

Options
-----
| Option                | Description                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `options` | This is exactly what you would pass to the normal js `fetch` |


### Option Usage
```js
const options = {
  method: 'POST'
}
const [data, loading, error] = useFetch(url, options)
```
