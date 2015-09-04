/**
 * Life cycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

const actions = [
  'getInitialState',
  'serialize',
  'deserialize'
]

actions.forEach(function(type) {
  exports[type] = { type }
})
