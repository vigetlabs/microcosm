/**
 * Render
 * Render changes to the screen
 */

import Layout    from '../views/layout'
import Microcosm from 'Microcosm'
import React     from 'react'

export function register (app, { el }, next) {
  let ui = (
    <Microcosm instance={ app }>
      <Layout app={ app } />
    </Microcosm>
  )

  React.render(ui, el)
  next()
}
