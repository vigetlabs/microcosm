import Circle from './stores/Circle'
import Microcosm from '../../src/Microcosm'
import React from 'react'
import Viget from './components/Viget'
import { update } from './actions/circle'

let app = new Microcosm()
let el  = document.getElementById('app')

app.addStore('circle', Circle)

app.listen(function() {
  React.render(<Viget { ...app.state } />, el)
})

app.start(function loop () {
  requestAnimationFrame(loop)
  app.push(update)
})
