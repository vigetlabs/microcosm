/**
 * Meta Domain
 * A domain for managing lifecycle methods and other
 * default behavior for other domains.
 */

import lifecycle from '../lifecycle'

export default {
  [lifecycle.willReset]: (_, next) => next
}
