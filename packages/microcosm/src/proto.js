/* @flow */

/**
 * Given a class and an object, convert a POJO into an ancestor
 */
export function inherit(config: *, Parent: Class<*>): * {
  if (typeof config === 'function') {
    return config
  }

  class NewEntity extends Parent {}

  for (var key in config) {
    Object.defineProperty(NewEntity.prototype, key, {
      configurable: true,
      enumerable: false,
      writeable: true,
      value: config[key]
    })
  }

  return NewEntity
}
