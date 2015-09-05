/**
 * Life cycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

const mapping = {
  'willStart'       : 'getInitialState',
  'willSerialize'   : 'serialize',
  'willDeserialize' : 'deserialize'
}

for (let type in mapping) {
  exports[type] = n => n
  exports[type].toString = () => type
}

exports.mapping = mapping
