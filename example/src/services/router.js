/**
 * Router
 * You could also use something like ReactRouter, but that doesn't
 * quite give Microcosm the same stress test
 */

import page from 'page'

let routes = {
  '/'         : require('../components/layouts/Home'),
  '/list/:id' : require('../components/layouts/Show')
}

export default {

  install(flux, action) {
    Object.keys(routes).forEach(route => {
      page(route, function({ params }) {
        flux.send(action, { handler: routes[route], params })
      })
    })

    page.start()
  }

}
