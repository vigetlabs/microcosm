import getRegistration from './get-registration'

export default function getDomainHandlers (domains, { command, status }) {
  let handlers = []

  for (var i = 0, len = domains.length; i < len; i++) {
    var [key, domain] = domains[i]

    if (domain.register) {
      var handler = getRegistration(domain.register(), command, status)

      if (handler) {
        handlers.push({ key, domain, handler })
      }
    }
  }

  return handlers
}
