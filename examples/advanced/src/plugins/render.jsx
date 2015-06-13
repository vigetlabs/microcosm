/**
 * Render
 * Render changes to the screen
 */

import React     from 'react'
import Layout    from '../views/layout'
import Microcosm from 'Microcosm'

export default {
  register(app, { el }, next) {
    React.render(<Microcosm instance={ app }><Layout app={ app } /></Microcosm>, el)
    next()
  }
}
