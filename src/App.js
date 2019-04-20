import React from 'react';
import './App.css';
import useFetch from './useFetch'
import { useGet, usePost } from './main'

const App = () => {
  // const [data, loading, error, refetch] = useFetch('https://api.etilbudsavis.dk/v2/dealerfront?country_id=DK')
  // const handleClick = () => {
  //   refetch()
  // }
  // const {data, loading, error, request} = useGet('https://api.etilbudsavis.dk/v2/dealerfront?country_id=DK')
  // const handleClick = () => {
  //   Get()
  // }

  // console.log('DATA: ', data)

  // const [data, loading, error] = usePost('https://jsonplaceholder.typicode.com/posts', {
  //   body: JSON.stringify({
  //     title: 'foo',
  //     body: 'bar',
  //     userId: 1
  //   }) 
  // })

  // WORKS 😍
  // const [data, loading, error, request] = useFetch({
  //   url: 'https://jsonplaceholder.typicode.com/posts/1',
  //   // baseUrl: '', // then you can do: request.post({ url: '/posts', body: {} })
  //   headers: {
  //     "Content-type": "application/json; charset=UTF-8"
  //   },
  //   // timeout: 1000,
  //   // onMount: true, // run on component did mount
  // })

  // const [data, loading, error, request] = useFetch('https://jsonplaceholder.typicode.com/posts/1')

  // const { data, loading, error, request, get, post, patch, put, del } = useFetch('https://jsonplaceholder.typicode.com/posts/1')
  const { data, loading, error, request, get, post, patch, put, del } = useFetch({
    baseUrl: 'https://jsonplaceholder.typicode.com/posts'
  })

  // useEffect(() => {
  //   // on component did mount or use 'onMount' option above
  //   request.get()
  // }, [request])

  // const [data, loading, error, get] = useGet({
  //   url: 'https://jsonplaceholder.typicode.com/posts/1'
  // })
  const handleClick = () => {
    // get('/1')
    // post('/', {
    //   // params: '?no=way&something=true',
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
    // patch('/1', {
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
    // put('/1', {
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
    // del('/1')
    // request.get()
    // request.post({
    //   // params: '?no=way&something=true',
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
    // request.patch({
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
    // request.put({
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
    // request.delete({
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
    // get()
    // post({
    //   // params: '?no=way&something=true',
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
    // patch({
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
    // put({
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
    // del({
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // })
  }


  if (error) return 'Error...'
  if (loading) return 'Loading...'

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={handleClick}>CLICK</button>
        <code style={{ display: 'block' }}>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </code>
      </header>
    </div>
  );
}

export default App;
