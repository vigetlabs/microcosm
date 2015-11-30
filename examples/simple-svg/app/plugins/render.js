import Viget from '../components/viget'
import DOM   from 'react-dom'
import React from 'react'
import { update } from '../actions/circle'

export default function Render (app, el, next) {
  function render (state) {
    DOM.render(<Viget { ...state } />, el)
  }

  render(app.state)

  app.listen(render)

  requestAnimationFrame(function loop() {
    requestAnimationFrame(loop)
    app.push(update)
  })

  next()
}
