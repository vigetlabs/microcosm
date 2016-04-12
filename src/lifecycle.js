/**
 * Life cycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

import tag from './action/tag'

export default {
  willStart       : tag(function getInitialState (n) { return n },'getInitialState'),
  willSerialize   : tag(function serialize (n) { return n }, 'serialize'),
  willDeserialize : tag(function deserialize (n) { return n }, 'deserialize'),
  willReset       : tag(function willReset (n) { return n }, 'willReset')
}
