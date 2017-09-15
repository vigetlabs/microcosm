import React from 'react'
import DOM from 'react-dom'
import { resolve } from 'microcosm-graphql'
import { makeRepo } from './repo'
import postsQuery from './posts.gql'

let repo = makeRepo()
let el = document.createElement('div')

document.body.appendChild(el)

function render() {
  let { posts } = repo.query(postsQuery)

  DOM.render(<ul>{posts.map(a => <li key={a.id}>{a.title}</li>)}</ul>, el)
}

repo.on('change', render)

render()

setTimeout(function() {
  repo.push('addPost', {
    title: 'How the Empire Struck Back',
    author: '2'
  })
}, 1000)
