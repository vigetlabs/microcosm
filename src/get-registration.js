export default function getRegistration (entity, behavior, status) {
  let type = behavior[status]

  if (entity.register != null) {
    var registry = entity.register()

    if (typeof registry[behavior] === 'object') {
      return registry[behavior][status]
    } else {
      return registry[type]
    }
  }
}
