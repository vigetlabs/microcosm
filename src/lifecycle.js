/**
 * Life cycle methods are implementated as actions. This module
 * enumerates through a preset list of types and creates associated
 * actions.
 */

import tag from './tag'

export default {
  willStart           : tag(n => n, 'getInitialState'),
  willSerialize       : tag(n => n, 'serialize'),
  willDeserialize     : tag(n => n, 'deserialize'),
  willReset           : tag(n => n, 'willReset'),

  // The following lifecycle methods are private for the time being:
  willUpdate          : tag(n => n, '__willUpdate'),
  willAddStore        : tag(n => n, '__willAddStore'),
  willAddPlugin       : tag(n => n, '__willAddPlugin'),
  willOpenTransaction : tag(n => n, '__willOpenTransaction')
}
