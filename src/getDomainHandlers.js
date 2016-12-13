import lifecycle from './lifecycle'
import { hasOwn } from './utils'

function format (string) {
  /*eslint-disable no-unused-vars*/
  const [ _, action, state = 'done' ] = `${ string }`.match(/(\w*)\_\d+[\_\w]*/) || []
  /*eslint-enable no-unused-vars*/

  return action ? action + '.' + state : string
}

function getHandler (key, domain, type) {
  let handler = hasOwn.call(lifecycle, type) ? domain[type] : undefined

  if (handler === undefined && domain.register) {
    const registrations = domain.register(type)

    if (process.env.NODE_ENV !== 'production') {
      console.assert(!hasOwn.call(registrations, type) || registrations[type] != undefined,
                     'A domain handler for "' + key + '" registered an undefined',
                     'handler for `' + format(type) + '`. Check the register',
                     'method for this domain.')
    }

    handler = registrations[type]
  }

  return handler ? { key, domain, handler } : null
}

export default function getDomainHandlers (domains, type) {
  let handlers = []

  for (var i = 0, len = domains.length; i < len; i++) {
    let [key, domain] = domains[i]

    let handler = getHandler(key, domain, type)

    if (handler) {
      handlers.push(handler)
    }
  }

  return handlers
}
