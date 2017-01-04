import lifecycle from './lifecycle'

export default function getDomainHandlers (domains, type) {
  let handlers = []
  let isLifecycle = lifecycle[type] != null

  for (var i = 0, len = domains.length; i < len; i++) {
    var [key, domain] = domains[i]

    var handler = null

    if (isLifecycle && domain[type] != null) {
      handler = domain[type]
    } else if (domain.register != null) {
      handler = domain.register()[type]
    }

    if (handler) {
      handlers.push({ key, domain, handler, length: handler.length })
    }
  }

  return handlers
}
