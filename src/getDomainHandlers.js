import lifecycle from './lifecycle'

export default function getDomainHandlers (domains, type) {
  let handlers = []
  let isLifecycle = !!lifecycle[type]

  for (var i = 0, len = domains.length; i < len; i++) {
    var [key, domain] = domains[i]

    var handler = isLifecycle ? domain[type] : undefined

    if (handler == undefined && domain.register) {
      const registrations = domain.register(type)

      if (process.env.NODE_ENV !== 'production') {
        console.assert(!registrations.hasOwnProperty(type) || registrations[type] != undefined,
                       'A domain handler for "', key, '" registered an undefined',
                       'handler for `', type, '`. Check the register',
                       'method for this domain.')
      }

      handler = registrations[type]
    }

    if (handler != null) {
      handlers.push({ key, domain, handler })
    }
  }

  return handlers
}
