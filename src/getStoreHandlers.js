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
      if (type in registrations && registrations[type] === undefined) {
        console.warn('The handler for "%s" within a store for "%s" is undefined. ' +
                     'Check the register method for this store.', format(type), key)
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
