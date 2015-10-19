import Chat from './components/chat'
import Messages from './stores/messages'
import Microcosm from '../../src/Microcosm'
import React from 'react'

let app = new Microcosm()
let el  = document.getElementById('app')

app.addStore('messages', Messages)

function render () {
  React.render(<Chat app={ app } { ...app.state } />, el)
}

app.start(render)
app.listen(render)
