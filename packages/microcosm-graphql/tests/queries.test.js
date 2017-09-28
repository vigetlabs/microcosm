import Repo from '../src/repo'
import gql from 'graphql-tag'

describe('Relationships', function() {
  let schema = gql`
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

    type Query {
      author: Author
      authors: [Author]
      post: Post
      posts: [Post]
    }
  `

  it.only('can reference other resources', () => {
    let repo = new Repo({ schema })

    repo.reset({
      Author: [{ id: 'a0', name: 'John' }],
      Post: [{ id: 'p0', author: 'a0', title: 'Johns Post' }]
    })

    let answer = repo.query(gql`
      {
        posts(id: p0) {
          title
          author {
            name
          }
        }
      }
    `)

    expect(answer).toMatchObject({
      posts: [
        {
          title: 'Johns Post',
          author: {
            name: 'John'
          }
        }
      ]
    })
  })
})
