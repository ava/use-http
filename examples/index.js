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


function App() {
  const [successful, setSuccessful] = useState(0)
  const [redundant, setRedundant] = useState(0)
  const [aData, loadingA, errorA, requestA] = useFetch(postUrl)
  const totalApiRequests = useRef(0)

  const handleAbortChange = () => {
    totalApiRequests.current++
    requestA.post({
      id: 'cool'
    })
  }

  const [bData, loadingB, _, requestB] = useFetch(delayedUrl)
  const clearAbortCount = () => {

  }

  // const [data1, loading1, error1, request1] = useFetch(allUrl)
  // const handleClick = () => request1.get()

  // const [data2, loading2, error2, { get }] = useFetch(allUrl)
  // const handleClick2 = () => get()

  // const [postData, loadingPost, errorPost, post] = usePost({
  //   baseUrl: baseUrl
  // })
  // const handleBaseURLClick = () => {
  //   post('/posts', {
  //     title: 'foo',
  //     body: 'bar',
  //     userId: 1
  //   })
  // }

  // const [patchData, loadingPatch, errorPatch, patch] = usePatch(allUrl)
  // const handlePatchClick = () => {
  //   patch({
  //     title: 'foo',
  //     body: 'bar',
  //     userId: 1
  //   })
  // }

  // const [deleteData, loadingDelete, errorDel, del] = useDelete(allUrl)
  // const handleDeleteClick = () => del()

  // const { data: data3, loading: loading3 } = useFetch(allUrl, { onMount: true })

  // const { data: data4, loading: loading4 } = useGet(allUrl, { onMount: true })
  // const [data5, loading5] = useGet(allUrl, { onMount: true })

  // const [postOnMountData, loadingPostOnMount] = usePost(postUrl, {
  //   body: JSON.stringify({
  //     title: 'foo',
  //     body: 'bar',
  //     userId: 1
  //   }),
  //   headers: {
  //     'Content-type': 'application/json; charset=UTF-8'
  //   },
  //   onMount: true
  // })

  // const [putData, loadingPut] = usePut({
  //   url: allUrl,
  //   onMount: true
  // })

  // const loading = loading1 || loading2 || loading3 || loading4 || loading5 || loadingPostOnMount || loadingPost || loadingPatch || loadingPut
  // const loading = loadingA

  // if (loading) return 'Loading...'
  const data = {
    // 'useFetch, array destructuring, request.get()': {
    //   data: data1,
    //   onClick: handleClick
    // },
    // 'useFetch, array destructuring, get()': {
    //   data: data2,
    //   onClick: handleClick2
    // },
    // 'usePost, baseUrl + relative routes': {
    //   data: postData,
    //   onClick: handleBaseURLClick
    // },
    // usePatch: {
    //   data: patchData,
    //   onClick: handlePatchClick
    // },
    // useDelete: {
    //   data: deleteData,
    //   onClick: handleDeleteClick
    // },
    // 'useFetch, object destructuring': {
    //   data: data3
    // },
    // 'useGet, object destructuring': {
    //   data: data4
    // },
    // 'useGet, array destructuring': {
    //   data: data5
    // },
    // 'usePost, onMount, headers, body': {
    //   data: postOnMountData
    // },
    // 'usePut, usePut({ url: "", onMount })': {
    //   data: putData
    // }
  }

  const ghUrl = 'https://api.github.com/search'
  const [ghData, ghLoading, ghError, ghRequest] = useFetch({
    baseUrl: `https://api.github.com/search`
  })
  const searchGithub = ({ target: { value: query } }) => {
    ghRequest.get(`/repositories?q=${query || "''"}`)
  }

  return (
    <>
      <h1>Github Repo Search Demo</h1>
      <input onChange={searchGithub} />
      {ghLoading ? (
        <div style={{display: 'flex'}}>
          Loading...
          <button onClick={() => ghRequest.abort()}>Cancel Request</button>
        </div>
      ) : ghData && ghData.items && (
        ghData.items.map(({ id, name, html_url }) => (
          <li key={id}><a target="_blank" rel="noreferrer noopener" href={html_url}>{name}</a></li>
        ))
      )}
      <h1>Typeaheads Demo</h1>
      <input onChange={handleAbortChange} />
      <div>Successful Requests: {totalApiRequests.current - requestA.abortedCount}</div>
      <div>Canceled Requests: {requestA.abortedCount}</div>
      <h1>On Click Demo</h1>
      <button onClick={() => requestB.post({ no: 'way' })}>Fetch Data</button>
      {loadingB ? (
        <div style={{display: 'flex'}}>
          Loading...
          <button onClick={() => requestB.abort()}>Cancel Request</button>
        </div>
      ) : bData && (
        <code style={{ display: 'block' }}>
          <pre>{JSON.stringify(bData, null, 2)}</pre>
        </code>
      )}
      {/* <button onClick={clearAbortCount}>Clear Count</button> */}
      {/* {Object.entries(data).map(([name, { data, onClick }]) => (
        <Fragment key={name}>
          <h2>{name}</h2>
          <code style={{ display: 'block' }}>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </code>
          {onClick && <button onClick={onClick}> Click Me</button>}
        </Fragment>
      ))} */}
    </>
  )
}

render(<App />, document.getElementById('root'))
