import DOM     from 'react-dom'
import Drawing from '../components/drawing'
import React   from 'react'

export default function Render (app, el) {
  function render () {
    DOM.render(<Drawing app={ app } />, el)
  }

  render()

  app.on('change', render)
}
