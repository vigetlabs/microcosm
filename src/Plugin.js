/**
 * Plugin
 * Helps to validate plugins
 */

import assert from './assert'

export default {

  validate(plugin) {
    assert('register' in plugin, 'Plugins must have a register method.')
  }

}
