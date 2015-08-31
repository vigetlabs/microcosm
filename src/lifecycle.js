/**
 * Life cycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

const actions = [
  'willStart',
  'willSerialize',
  'willDeserialize'
]

for (let type in actions) {
  exports[type] = function() {}
  exports[type].name = type
  exports[type].toString = () => type
}
