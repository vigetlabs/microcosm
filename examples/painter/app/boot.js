import React     from 'react'
import DOM       from 'react-dom'
import Debugger  from 'microcosm-debugger'
import Repo      from './repo'
import Workspace from './presenters/workspace'

const repo = new Repo({ maxHistory: Infinity })
const el = document.querySelector('#app')

Debugger(repo)

function render () {
  DOM.unmountComponentAtNode(el)
  DOM.render(<Workspace repo={repo} />, el)
}

render()

if (module.hot) {
  module.hot.accept('./presenters/workspace', render)
}
