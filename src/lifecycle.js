/**
 * Life cycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

exports.mapping = {
  'willStart'       : 'getInitialState',
  'willSerialize'   : 'serialize',
  'willDeserialize' : 'deserialize'
}

for (let type in exports.mapping) {
  exports[type] = { type }
  exports[type].toString = () => type
}
