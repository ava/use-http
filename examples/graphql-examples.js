import React, { useEffect } from 'react'
import useFetch from '../src'


const GraphQLQueryExample = () => {
  const query = `
    {
      allPosts {
        title
      }
    }
  `
  
  const posts = useFetch('http://localhost:3000')

  useEffect(() => {
    posts.query(query)
  }, [])

  if (posts.loading) return <div>⏱Loading...</div>

  return <pre>{JSON.stringify(posts.data, null, 2)}</pre>
}


const GraphQLMutationExample = () => {
  // TODO: this works, but this example doesn't. Need to finish
  // also, the syntax below is a little wonky, need to fix
  const mutation = `
    mutation ChangePostTitle($id Int, $title String) {
      Post(id: $id, title: $title) {
        title
        Comments {
          body
        }
      }
    }
  `
  
  const posts = useFetch('http://localhost:3000')

  useEffect(() => {
    posts.mutate(mutation)
  }, [])

  if (posts.loading) return <div>⏱Loading...</div>

  return <pre>{JSON.stringify(posts.data, null, 2)}</pre>
}

const GraphQLExamples = () => (
  <>
    <h1>GraphQL Examples</h1>
    <h4>Query Example</h4>
    <GraphQLQueryExample />
    <h4>Mutation Example</h4>
    <GraphQLMutationExample />
  </>
)

export default GraphQLExamples