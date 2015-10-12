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

const LIFECYCLE = {}

for (let type in MAPPING) {
  LIFECYCLE[type] = n => n
  LIFECYCLE[type].toString = () => MAPPING[type]
}

export default LIFECYCLE
