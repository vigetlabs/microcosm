import Chat  from '../components/chat'
import DOM   from 'react-dom'
import React from 'react'

export default function Render (app, el) {
  function render () {
    DOM.render(<Chat app={ app } />, el)
  }

  render()

  app.listen(render)
}
