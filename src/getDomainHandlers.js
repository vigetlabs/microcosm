function format (string) {
  /*eslint-disable no-unused-vars*/
  const [ _, action, state ] = `${ string }`.match(/(\w*)\_\d+\_(\w*)/, ' ') || []
  /*eslint-enable no-unused-vars*/

  return action ? `the ${ action } action's ${ state } state` : string
}

function getHandler (key, domain, type) {
  let handler = domain[type]

  if (handler === undefined && domain.register) {
    const registrations = domain.register()

    if (process.env.NODE_ENV !== 'production') {
      if ('undefined' in registrations) {
        throw new Error(`When dispatching ${ format(type) } to the ${ key } domain, `
                        + `we encountered an "undefined" attribute within register(). `
                        + `This usually happens when an action is imported `
                        + `from the wrong namespace, or by referencing an invalid `
                        + `action state.`)
      }

      if (type in registrations && registrations[type] === undefined) {
        throw new Error(`The handler for "${ format(type) }" within a domain for "${ key }" `
                        + `is undefined. Check the register method for this domain.`)
      }
    }

    handler = registrations[type]
  }

  return handler
}

export default function getDomainHandlers (entries, type) {

  return entries.reduce(function (handlers, entry) {
    let key     = entry[0]
    let domain  = entry[1]
    let handler = getHandler(key, domain, type)

    return handler === undefined ? handlers : handlers.concat({ key, domain, handler })
  }, [])
}
