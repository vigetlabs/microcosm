/**
 * Meta Store
 * A store for managing lifecycle methods and other
 * default behavior for other stores.
 */

import lifecycle from '../lifecycle'

export default {
  [lifecycle.willReset] : (state, next) => next
}
