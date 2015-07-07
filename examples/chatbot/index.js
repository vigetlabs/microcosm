import Chat from './components/chat'
import Messages from './stores/messages'
import Microcosm from 'Microcosm'
import React from 'react'

import "./style"

let app = new Microcosm()

app.addStore('messages', Messages)

app.listen(function () {
  React.render(<Chat app={ app } { ...app.state } />, document.getElementById('app'))
})

app.start()
