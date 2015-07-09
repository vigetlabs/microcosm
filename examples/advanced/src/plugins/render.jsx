/**
 * Render
 * Render changes to the screen
 */

import Layout     from '../views/layout'
import Microscope from 'addons/microscope'
import React      from 'react'

function register (app, { el }, next) {
  let ui = (
    <Microscope instance={ app }>
      <Layout app={ app } />
    </Microscope>
  )

  React.render(ui, el)
  next()
}

export default { register }
