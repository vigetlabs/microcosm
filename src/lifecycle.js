/**
 * Life cycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

const Transaction = require('./Transaction')

const actions = [
  'getInitialState',
  'serialize',
  'deserialize'
]

actions.forEach(function(type) {
  exports[type] = function() {}
  exports[type].toString = () => type
  exports[type].toTransaction = () => Transaction.create(type, null, { active: true })
})
