import React from 'react'
import DOM from 'react-dom'
import GraphPresenter from './graph-presenter'
import Model from './model.gql'
import { makeRepo } from './repo'

class Example extends GraphPresenter {
  model = Model

  renderItem(item) {
    return (
      <li key={item.id}>
        {item.title} by {item.author.name}
      </li>
    )
  }

  render() {
    const { posts } = this.state.model

    return <ul>{posts.map(this.renderItem, this)}</ul>
  }
}

let el = document.createElement('div')
let repo = makeRepo()

document.body.appendChild(el)

DOM.render(<Example repo={repo} />, el)

requestAnimationFrame(function loop() {
  requestAnimationFrame(loop)
  repo.push('updatePost', { id: '2', title: Math.random() * 10000 })
})
