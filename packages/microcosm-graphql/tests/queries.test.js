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

  it('can reference other resources', async () => {
    let repo = new Repo({ schema })

    repo.reset({
      Author: [{ id: 'a0', name: 'John' }],
      Post: [{ id: 'p0', author: 'a0', title: 'Johns Post' }]
    })

    let { post } = repo.query(
      gql`
        query PostsWithAuthors {
          post(id: p0) {
            author {
              name
              posts(id: p1) {
                id
              }
            }
          }
        }
      `
    )

    expect(post.author.name).toEqual('John')
    expect(post.author.posts[0].id).toEqual('p0')
  })
})
