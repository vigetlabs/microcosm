import Repo from '../src/repo'
import gql from 'graphql-tag'

it('generates a domain for each field in the Query type', () => {
  let schema = gql`
    type Author {
      id: ID
      name: Name
    }

    type Post {
      id: ID
      title: String
      author: Author
    }

    type UI @singular {
      showMenu: Boolean
    }

    type Query {
      author: Author
      authors: [Author]
      post: Post
      posts: [Post]
      ui: UI
    }

    type Mutation {
      createAuthor(name: String): Author
    }
  `

  let repo = new Repo({ schema })

  expect(repo.state).toEqual({
    Author: [],
    Post: [],
    UI: {}
  })
})

it('supports singular domains', () => {
  let schema = gql`
    type UI @singular {
      showMenu: Boolean
    }
  `

  let repo = new Repo({ schema })

  expect(repo.state.UI).toEqual({})
})
