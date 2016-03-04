/**
 * Ensure defaults and formatting for Stores and Plugins
 */

export default function defaults (config) {
  return typeof config === 'function' ? { register: config } : config
}
