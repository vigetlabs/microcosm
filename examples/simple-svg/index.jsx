import Circle from './stores/Circle'
import Microcosm from 'Microcosm'
import React from 'react'
import Viget from './components/Viget'
import { update } from './actions/circle'

let app = new Microcosm()
app.shouldTransactionMerge = n => false

let el  = document.getElementById('app')

app.addStore('circle', Circle)

app.listen(function() {
  React.render(<Viget { ...app.state } />, el)
})

var i = 0;
app.start(function loop () {
  requestAnimationFrame(loop)
  i++
  console.time('Push Update ' + i)
  app.push(update)
  console.timeEnd('Push Update ' + i)
})
