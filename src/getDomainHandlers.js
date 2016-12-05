import lifecycle from './lifecycle'

function format (string) {
  /*eslint-disable no-unused-vars*/
  const [ _, action, state = 'done' ] = `${ string }`.match(/(\w*)\_\d+[\_\w]*/) || []
  /*eslint-enable no-unused-vars*/

  return action ? action + '.' + state : string
}

function getHandler (key, domain, type) {
  let handler = lifecycle.hasOwnProperty(type) ? domain[type] : undefined

  if (handler === undefined) {
    const registrations = domain.register(type)

    if (process.env.NODE_ENV !== 'production') {
      if (registrations.hasOwnProperty(type) && typeof registrations[type] !== 'function') {
        console.warn('Unable to register `%s` at domain path `["%s"]`. Handlers ' +
                     'must be functions, instead got `%s`. Check the register ' +
                     'method for this domain.',
                     format(type), key.join('", "'), typeof registrations[type])
        return null
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
