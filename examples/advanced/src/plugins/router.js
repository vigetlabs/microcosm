/**
 * Router
 * You could also use something like ReactRouter, but that doesn't
 * quite give Microcosm the same stress test
 */

import Route from 'actions/route'
import page from 'page'

page.base('/advanced')

let routes = [
  { path: '/', handler: require('../views/pages/home') },
  { path: '/list/:id', handler: require('../views/pages/show') }
]

export default {

  register(app, options, next) {
    let action = app.push.bind(app, Route.set)

    // Create a callback for each route that pushes the event
    // into the app's dispatcher
    //
    // TODO: Ideally, we'd detect that the route changed and
    // reduce down to a route/handler within the associated
    // store or action
    routes.forEach(({ path, handler }) => {
      page(path, ({ params }) => action({ handler, params }))
    })

    page.start({ hashbang: true })

    next()
  }

}
