import DOM from 'react-dom'
import React from 'react'
import Microcosm from 'microcosm'
import Circle from './domains/circle'
import Logo from './views/logo'
import { animate } from './actions/animate'

let repo = new Microcosm()
let el = document.getElementById('app')

repo.addDomain('circle', Circle)

repo.on('change', function (state) {
  DOM.render(<Logo {...state} />, el)
})

function loop ({ time = Date.now() } = {}) {
  repo.push(animate, time, 1000).onDone(loop)
}

loop()

if (module.hot) {
  module.hot.accept()
}
