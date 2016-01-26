import DOM     from 'react-dom'
import Drawing from '../components/drawing'
import React   from 'react'

export default function Render (app, el, next) {
  function render () {
    DOM.render(<Drawing app={ app } />, el)
  }

  render()

  app.listen(render)

  next()
}
