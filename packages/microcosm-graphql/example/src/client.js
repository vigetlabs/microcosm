import React from 'react'
import DOM from 'react-dom'
import GraphPresenter from './graph-presenter'
import { get } from 'microcosm'
import PostForm from './post-form'
import gql from 'graphql-tag'
import { makeRepo } from './repo'

class Example extends GraphPresenter {
  model = gql`
    query {
      posts {
        id
        title
        author {
          name
        }
      }
      authors {
        id
        name
      }
    }
  `

  renderItem(item) {
    return (
      <li key={item.id}>
        <i>{item.title}</i> by{' '}
        {get(item, 'author.name', '...Someone. Hold on a sec!')}
      </li>
    )
  }

  send = (action, payload) => {
    return this.props.repo.push(action, payload)
  }

  render() {
    const { posts, authors } = this.state.model

    return (
      <div>
        <ul className="post-list">{posts.map(this.renderItem, this)}</ul>
        <hr />
        <PostForm authors={authors} send={this.send} />
      </div>
    )
  }
}

let el = document.createElement('div')
let repo = makeRepo()

repo.addQuery('Query', {
  posts: {
    setup(repo) {
      return repo.push('readPost')
    },
    resolver(state) {
      return state.Post
    }
  }
})

repo.addQuery('Post', {
  author: {
    setup(repo, args) {
      return repo.push('readAuthor')
    },
    resolver(post) {
      return repo.state.Author.find(author => author.id === post.author)
    }
  }
})

DOM.render(<Example repo={repo} />, document.getElementById('app'))

requestAnimationFrame(function loop() {
  repo._emit('change', repo.state)

  requestAnimationFrame(loop)
})
