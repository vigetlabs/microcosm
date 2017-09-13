import DOM from 'react-dom'
import React from 'react'
import { AppContainer } from 'react-hot-loader'
import Repo from './repo'
import Application from './presenters/application'

import './style.css'

export function initDevTools(shell) {
  shell.connect(bridge => {
    window.bridge = bridge
    initApp()
  })
}

export function initApp() {
  let repo = new Repo({ bridge: window.bridge })
  let el = document.getElementById('app')

  DOM.unmountComponentAtNode(el)
  DOM.render(
    <AppContainer>
      <Application repo={repo} />
    </AppContainer>,
    el
  )
}

if (module.hot) {
  module.hot.accept(initApp)
}
