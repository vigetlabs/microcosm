/**
 * Lifecycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

export default {
  willStart       : 'getInitialState',
  willSerialize   : 'serialize',
  willDeserialize : 'deserialize',
  willReset       : '__willReset',
  willReplace     : '__willReplace'
}
