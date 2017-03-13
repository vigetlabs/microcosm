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

    action.resolve(payload)
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
