import tag from './tag'

function sandbox (data, deserialize) {
  return (action, repo) => {
    let payload = data

    if (deserialize) {
      try {
        payload = repo.deserialize(data)
      } catch (error) {
        action.reject(error)
      }
    }

    // Strip out keys not managed by this repo. This prevents
    // children from accidentally having their keys reset by
    // parents.
    let sanitary = repo.realm.prune({}, payload)

    action.resolve(sanitary)
  }
}

export const RESET = tag(function $reset (data, deserialize) {
  return sandbox(data, deserialize)
}, '$reset')

export const PATCH = tag(function $patch (data, deserialize) {
  return sandbox(data, deserialize)
}, '$patch')

export const BIRTH = function $birth () {
  console.assert(false, 'Birth lifecycle method should never be invoked directly.')
}

export const START = function $start () {
  console.assert(false, 'Start lifecycle method should never be invoked directly.')
}

export const ADD_DOMAIN = function $addDomain (domain) {
  return domain
}
