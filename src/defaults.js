/**
 * Ensure defaults and formatting for Stores and Plugins
 */

import { isFunction } from './type-checks'

export default function defaults (config) {
  return isFunction(config) ? { register: config } : config
}
