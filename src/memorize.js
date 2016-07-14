function getHandler (key, store, type) {
  let handler = store[type]

  if (handler === undefined && store.register) {
    const registrations = store.register()

    if (process.env.NODE_ENV !== 'production') {
      if ('undefined' in registrations) {
        throw new Error(`When dispatching '${ type }' to a store for '${ key }', `
                        + `we discovered an 'undefined' property within the store's `
                        + `register function. This usually happens when an action `
                        + `is imported from the wrong namespace, or by referencing an `
                        + `invalid action state.`)
      }

      if (type in registrations && registrations[type] === undefined) {
        throw new Error(`The handler for '${ type }' within a store for '${ key }' `
                        + `is undefined. Check the register method for this store.`)
      }
    }

    handler = registrations[type]
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
