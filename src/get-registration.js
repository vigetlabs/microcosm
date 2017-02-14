import lifecycle from './lifecycle'

export default function getRegistration (entity, behavior, status) {
  let isLifecycle = lifecycle[behavior] != null
  let type = behavior[status]

  if (isLifecycle && entity[behavior] != null) {
    return entity[behavior]
  } else if (entity.register != null) {
    var registry = entity.register()

    if (typeof registry[behavior] === 'object') {
      return registry[behavior][status]
    } else {
      return registry[type]
    }
  }
}
