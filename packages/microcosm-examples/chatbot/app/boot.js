import React from 'react'
import DOM from 'react-dom'
import Repo from './repo'
import Chat from './views/chat'

let repo = new Repo({ batch: true, debug: true })
let el = document.getElementById('app')

DOM.render(<Chat repo={repo} />, el)
