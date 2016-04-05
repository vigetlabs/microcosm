/**
 * Life cycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

export default {
  willStart           : 'getInitialState',
  willSerialize       : 'serialize',
  willDeserialize     : 'deserialize',
  willReset           : 'willReset',

  // The following lifecycle methods are private for the time being:
  willUpdate          : '__willUpdate',
  willAddStore        : '__willAddStore',
  willAddPlugin       : '__willAddPlugin',
  willOpenTransaction : '__willOpenTransaction'
}
