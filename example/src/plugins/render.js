/**
 * Render
 * Render changes to the screen
 */

import React  from 'react'
import Layout from '../components/Layout'

export default {

  render(app, el) {
    React.render(<Layout app={ app } { ...app.toObject() } />, el)
  },

  register(app, { el }, next) {
    app.listen(() => this.render(app, el))

    this.render(app, el)

    next()
  }

}
