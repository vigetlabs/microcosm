import { ACTION_ALIASES } from './constants'

const DONE = 'done'

function isObject (target) {
  return target && typeof target === 'object'
}

export default function getRegistration (entity, behavior, status) {
  var alias = status ? ACTION_ALIASES[status] : DONE

  if (alias == null) {
    throw new ReferenceError('Invalid action status ' + status)
  }

  if (entity.register) {
    var registry = entity.register()

    if (isObject(registry[behavior])) {
      return registry[behavior][alias] || registry[behavior][status]
    } else {
      return registry[behavior[alias]]
    }
  }

  return null
}
