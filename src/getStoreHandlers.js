function format (string) {
  /*eslint-disable no-unused-vars*/
  const [ _, action, state ] = `${ string }`.match(/(\w*)\_\d+\_(\w*)/, ' ') || []
  /*eslint-enable no-unused-vars*/

  return action ? `the ${ action } action's ${ state } state` : string
}

function getHandler (key, store, type) {
  let handler = store[type]

  if (handler === undefined && store.register) {
    const registrations = store.register()

    if (process.env.NODE_ENV !== 'production') {
      if ('undefined' in registrations) {
        throw new Error(`When dispatching ${ format(type) } to the ${ key } store, `
                        + `we encountered an "undefined" attribute within register(). `
                        + `This usually happens when an action is imported `
                        + `from the wrong namespace, or by referencing an invalid `
                        + `action state.`)
      }

      if (type in registrations && registrations[type] === undefined) {
        throw new Error(`The handler for "${ format(type) }" within a store for "${ key }" `
                        + `is undefined. Check the register method for this store.`)
      }
    }

    handler = registrations[type]
  }

  return handler
}

export default function getStoreHandlers (entries, type) {

  return entries.reduce(function (handlers, entry) {
    let key     = entry[0]
    let store   = entry[1]
    let handler = getHandler(key, store, type)

    return handler === undefined ? handlers : handlers.concat({ key, store, handler })
  }, [])
}
