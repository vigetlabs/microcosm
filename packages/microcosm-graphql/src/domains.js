import { sync } from './sync'

function tableFactory(repo, type, mutationDefs = []) {
  let Domain = {
    actions: {},
    register: {},
    getInitialState() {
      return []
    }
  }

  const reader = sync('read' + type)

  Domain.actions[reader.name] = reader.action
  Domain.register[reader.name] = reader.handler

  mutationDefs.forEach(mutation => {
    const { name, action, handler } = sync(mutation.name)

    if (action) {
      Domain.actions[name] = action
      Domain.register[name] = handler
    }
  })

  return Domain
}

function recordFactory() {
  return {
    getInitialState() {
      return {}
    }
  }
}

export function domainFactory(repo, type, mutations) {
  if (type.isSingular) {
    return recordFactory(repo, type.name, mutations)
  }

  return tableFactory(repo, type.name, mutations)
}
