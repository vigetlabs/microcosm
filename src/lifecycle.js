import tag from './tag'

export const RESET = tag(function (data, deserialize) {
  return (action, repo) => {
    action.resolve(deserialize ? repo.deserialize(data) : data)
  }
}, 'reset')

export const PATCH = tag(function (data, deserialize) {
  return (action, repo) => {
    action.resolve(deserialize ? repo.deserialize(data) : data)
  }
}, 'patch')

export const ADD_DOMAIN = 'addDomain'
