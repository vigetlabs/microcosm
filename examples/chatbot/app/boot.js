import React from 'react'
import DOM from 'react-dom'
import Repo from './repo'
import Chat from './views/chat'

const repo = new Repo({ debug: true, maxHistory: Infinity })

function render() {
  DOM.render(<Chat repo={repo} />, document.getElementById('app'))
}

render()

if (module.hot) {
  module.hot.accept(render)
}
