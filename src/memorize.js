function getHandler (key, store, type) {
  let handler = store[type]

  if (handler === undefined && store.register) {
    handler = store.register()[type]
  }

  if (handler !== undefined && typeof handler !== 'function') {
    throw new TypeError(`Store handlers must be functions. Instead got "${ handler }"`)
  }

  return handler
}

export default function memorize (entries, type) {

  return entries.reduce(function (handlers, entry) {
    let key     = entry[0]
    let store   = entry[1]
    let handler = getHandler(key, store, type)

    return handler === undefined ? handlers : handlers.concat({ key, store, handler })
  }, [])
}
