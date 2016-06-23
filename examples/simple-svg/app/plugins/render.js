import Viget from '../components/Viget'
import DOM   from 'react-dom'
import React from 'react'
import { animate } from '../actions/circle'

export default function Render (app, el) {
  function render (state) {
    DOM.render(<Viget { ...state } />, el)
  }

  render(app.state)

  app.on('change', render)

  function loop ({ time = Date.now() } = {}) {
    app.push(animate, time, 1000).onDone(loop)
  }

  loop()
}
