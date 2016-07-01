import DOM         from 'react-dom'
import React       from 'react'
import SimpleSVG   from './app/simple-svg'
import View        from './app/view'
import { animate } from './app/actions'

const app = new SimpleSVG()

app.on('change', function (state) {
  DOM.render(<View { ...state } />, document.getElementById('app'))
})

// Seed the application with the same data that was used to render
// the static html
app.replace(window['SIMPLE_SVG_SEED'])

function loop ({ time = Date.now() } = {}) {
  app.push(animate, time, 1000).onDone(loop)
}

loop()
