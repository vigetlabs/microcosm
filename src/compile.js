import { formatTag } from './tag'

function generate (key, store, type) {
  let handler = store[type]

  if (handler === undefined && store.register) {
    let registrations = store.register()

    if (process.env.NODE_ENV !== 'production' && type in registrations && registrations[type] === undefined) {
      console.warn(`Store for ${ key } is registered to the action ${ formatTag(type) }, but the handler is undefined! Check the store's register function.`)
    }

    handler = registrations[type]
  }

  return handler
}

export default function compile (entries, type) {
  return entries.map(function ([ key, store ]) {
    return { key, store, handler: generate(key, store, type) }
  })
}
