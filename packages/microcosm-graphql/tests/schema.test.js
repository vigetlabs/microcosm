import { getQueries } from '../src/schema'
import gql from 'graphql-tag'

let document = gql`
  type Author {
    id: ID
    name: String
    posts: [Post]
  }

  type Post {
    id: ID
    title: String
    author: Author
  }
`

describe('Type scanning', function() {
  let schema = null

  beforeEach(() => {
    schema = getQueries(document)
  })

  it('builds type for singular data', () => {
    expect(schema.Author.fields['id']).toMatchObject({
      type: 'ID',
      name: 'id',
      isList: false
    })
  })

  it('builds type for list data', () => {
    expect(schema.Author.fields['posts']).toMatchObject({
      type: 'Post',
      name: 'posts',
      isList: true
    })
  })
})
