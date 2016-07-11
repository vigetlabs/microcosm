import DOM         from 'react-dom'
import React       from 'react'
import Microcosm   from '../../../src/microcosm'
import Circle      from './stores/circle'
import Logo        from './views/logo'
import { animate } from './actions/animate'

const app = new Microcosm()
const el  = document.getElementById('app')

app.addStore('circle', Circle)

app.on('change', function (state) {
  DOM.render(<Logo { ...state } />, el)
})

function loop ({ time = Date.now() } = {}) {
  app.push(animate, time, 1000).onDone(loop)
}

loop()
