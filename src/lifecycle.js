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
  willUpdate          : tag(n => n, 'willUpdate'),

  willAddStore        : tag(n => n, 'willAddStore'),
  willAddPlugin       : tag(n => n, 'willAddPlugin'),
  willOpenTransaction : tag(n => n, 'willOpenTransaction')
}
