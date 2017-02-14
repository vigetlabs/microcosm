import tag from './tag'

export const RESET = tag(function (data, deserialize) {
  return (action, repo) => {
    action.resolve(deserialize ? repo.deserialize(data) : data)
  }
}, '__reset')

export const PATCH = tag(function (data, deserialize) {
  return (action, repo) => {
    action.resolve(deserialize ? repo.deserialize(data) : data)
  }
}, '__patch')

export const ADD_DOMAIN = '__addDomain'
