/**
 * Lifecycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

export default {
  getInitialState : 'getInitialState',
  serialize       : 'serialize',
  deserialize     : 'deserialize',
  _willRebase     : '_willRebase',
  _willReset      : '_willReset',
  _willPatch      : '_willPatch'
}
