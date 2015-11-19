import Viget from '../components/viget'
import DOM   from 'react-dom'
import React from 'react'
import { update } from '../actions/circle'

export default function Render (app, el, next) {
  function render () {
    DOM.render(<Viget { ...app.state } />, el)
  }

  render()

  app.listen(render)

  requestAnimationFrame(function loop() {
    app.push(update)
    requestAnimationFrame(loop)
  })

  next()
}
