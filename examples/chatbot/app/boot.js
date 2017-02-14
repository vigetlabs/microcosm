import React from 'react'
import DOM from 'react-dom'
import Debugger from 'microcosm-debugger'
import Repo from './repo'
import Chat from './views/chat'

const repo = new Repo({ maxHistory: Infinity })

Debugger(repo)

function render () {
  DOM.render(<Chat repo={repo} />, document.getElementById('app'))
}

render()

if (module.hot) {
  module.hot.accept(render)
}
