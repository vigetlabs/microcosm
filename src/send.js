/**
 * send
 * A generalized function for sending a message to a Microcosm
 */

import Action from './Action'

export default function(app, signal, ...params) {
  Action.validate(signal)

  const request = signal.apply(app, params)

  // Actions some times return promises. When this happens, wait for
  // them to resolve before moving on
  if (request instanceof Promise) {
    return request.then(body => app.dispatch(signal, body))
  }

  return app.dispatch(signal, request)
}
