import { sync } from './sync'

function tableFactory(repo, mutationDefs = []) {
  let Domain = {
    actions: {},
    register: {},
    getInitialState() {
      return []
    }
  }

  mutationDefs.forEach(mutation => {
    const { action, handler } = sync(mutation.name)

    if (action) {
      Domain.actions[action] = action
      Domain.register[action] = handler
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

export function domainFactory(repo, shape, mutations) {
  if (shape === 'single') {
    return recordFactory(repo, mutations)
  }

  return tableFactory(repo, mutations)
}
