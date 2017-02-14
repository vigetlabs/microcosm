import getRegistration from './get-registration'

export default function getDomainHandlers (domains, { behavior, status }) {
  let handlers = []

  for (var i = 0, len = domains.length; i < len; i++) {
    var [key, domain] = domains[i]

    var handler = getRegistration(domain, behavior, status)

    if (handler) {
      handlers.push({ key, domain, handler, length: handler.length })
    }
  }

  return handlers
}
