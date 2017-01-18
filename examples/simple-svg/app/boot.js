import DOM         from 'react-dom'
import React       from 'react'
import Microcosm   from 'microcosm'
import Circle      from './domains/circle'
import Logo        from './views/logo'
import { animate } from './actions/animate'

let repo = new Microcosm()
let el = document.getElementById('app')
let Badge = Logo

repo.addDomain('circle', Circle)

repo.on('change', function (state) {
  DOM.render(<Badge { ...state } />, el)
})

function loop ({ time = Date.now() } = {}) {
  repo.push(animate, time, 1000).onDone(loop)
}

loop()

if (module.hot) {
  module.hot.accept('./views/logo', () => {
    Badge = require('./views/logo').default
  })
}
