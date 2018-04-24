import React from 'react'
import DOM from 'react-dom'
import Repo from './repo'
import Workspace from './views/workspace'

let repo = new Repo({ batch: true })
let el = document.querySelector('#app')

DOM.render(<Workspace repo={repo} />, el)
