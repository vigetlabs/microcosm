/**
 * Action
 * Helps to validate actions
 */

import assert from './assert'

export default {

  validate(action) {
    assert(typeof action === 'function', `Action ${ action } is not callable, actions should be functions`)
  }

}
