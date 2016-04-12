import Viget from '../components/Viget'
import DOM   from 'react-dom'
import React from 'react'
import { animate } from '../actions/circle'

export default function Render (app, el) {
  function render (state) {
    DOM.render(<Viget { ...state } />, el)
  }

  render(app.state)

  app.listen(render)

  app.workflow(animate, Date.now(), function again (error, endTime) {
    app.workflow(animate, endTime, again)
  })
}
