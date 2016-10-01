import update from './update'

function format (string) {
  /*eslint-disable no-unused-vars*/
  const [ _, action, state ] = `${ string }`.match(/(\w*)\_\d+\_(\w*)/, ' ') || []
  /*eslint-enable no-unused-vars*/

  return action ? `the ${ action } action's ${ state } state` : string
}

function getHandler (key, domain, type) {
  let handler = domain[type]

  if (handler === undefined) {
    const registrations = domain.register(type)

    if (process.env.NODE_ENV !== 'production') {
      if (registrations.hasOwnProperty(type) && registrations[type] === undefined) {
        console.warn('The handler for %s within a domain for "%s" is undefined. ' +
                     'Check the register method for this domain.', format(type), key)
      }
    }

    handler = registrations[type]
  }

  return handler ? { key, domain, handler } : null
}

export default function getDomainHandlers (domains, type) {
  let handlers = []

  domains.forEach(function ([key, domain]) {
    let handler = getHandler(key, domain, type)

    if (handler) {
      handlers.push(handler)
    }
  })

  return handlers
}
