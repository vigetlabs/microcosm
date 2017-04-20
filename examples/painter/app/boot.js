import React from 'react'
import DOM from 'react-dom'
import Debugger from 'microcosm-debugger'
import { AppContainer } from 'react-hot-loader'
import Repo from './repo'
import Workspace from './views/workspace'

let repo = new Repo({ maxHistory: Infinity })

Debugger(repo)

function render () {
  DOM.render(
    <AppContainer>
      <Workspace repo={repo} />
    </AppContainer>,
    document.querySelector('#app')
  )
}

render()

if (module.hot) {
  module.hot.accept('./views/workspace', render)
}
