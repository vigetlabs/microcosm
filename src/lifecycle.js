/**
 * Life cycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

const MAPPING = {
  'willStart'       : 'getInitialState',
  'willSerialize'   : 'serialize',
  'willDeserialize' : 'deserialize',
  'willReset'       : 'willReset'
}

for (let type in MAPPING) {
  exports[type] = n => n
  exports[type].toString = () => MAPPING[type]
}

exports.MAPPING = MAPPING
