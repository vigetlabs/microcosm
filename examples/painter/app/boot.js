import React     from 'react'
import DOM       from 'react-dom'
import Debugger  from 'microcosm-debugger'
import Repo      from './repo'
import Workspace from './views/workspace'

const repo = new Repo({ maxHistory: Infinity })

Debugger(repo)

function render () {
  DOM.render(<Workspace repo={repo} />,  document.querySelector('#app'))
}

render()

if (module.hot) {
  module.hot.accept(render)
}
