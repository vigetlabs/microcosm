import Circle     from './stores/Circle'
import Microcosm  from 'Microcosm'
import Microscope from 'addons/microscope'
import React      from 'react'
import Viget      from './components/Viget'
import { update } from './actions/circle'

let app = new Microcosm()

app.addStore('circle', Circle)

app.start(function() {
  requestAnimationFrame(function loop () {
    requestAnimationFrame(loop)
    app.push(update)
  })

  React.render(<Microscope instance={ app }><Viget /></Microscope>, document.body)
})
