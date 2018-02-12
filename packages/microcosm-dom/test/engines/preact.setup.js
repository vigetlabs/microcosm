/**
 * Prepend all test suite names with preact prefix for easier debugging
 */
const oldDescribe = describe
global.describe = function(test, ...args) {
  return oldDescribe('microcosm-dom/preact ' + test, ...args)
}
Object.assign(global.describe, oldDescribe)
