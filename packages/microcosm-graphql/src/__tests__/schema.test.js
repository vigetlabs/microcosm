import Schema from '../schema'
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
    schema = new Schema(document)
  })

  it('builds type for singular data', () => {
    expect(schema.structure('Author.id')).toEqual({
      type: 'ID',
      name: 'id',
      list: false
    })
  })

  it('builds type for list data', () => {
    expect(schema.structure('Author.posts')).toEqual({
      type: 'Post',
      name: 'posts',
      list: true
    })
  })
})
