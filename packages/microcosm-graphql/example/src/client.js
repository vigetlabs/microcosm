import React from 'react'
import DOM from 'react-dom'
import Presenter from 'microcosm/addons/presenter'
import { makeRepo } from './repo'
import postsQuery from './posts.gql'

let repo = makeRepo()
let el = document.createElement('div')

document.body.appendChild(el)

class Example extends Presenter {
  getModel() {
    return {
      posts: () => this.repo.query(postsQuery).posts
    }
  }

  ready(repo) {
    const post = {
      title: 'How the Empire Struck Back',
      author: '2'
    }

    setTimeout(repo.prepare('addPost', post), 1000)
  }

  renderItem(item) {
    return <li key={item.id}>{item.title}</li>
  }

  render() {
    const { posts } = this.model

    return <ul>{posts.map(this.renderItem, this)}</ul>
  }
}

DOM.render(<Example repo={repo} />, el)
