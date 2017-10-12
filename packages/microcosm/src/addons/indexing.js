/**
 * This is a compatability model for the experimental indexing feature in 11.x
 * This is not for public consumption!
 * @flow weak
 */

import Microcosm, { get, set } from '../index'
import { getKeyPaths } from '../key-path'

/**
 * Given a query (see above), return a subset of an object.
 * @private
 */
function extract(object, keyPaths, seed) {
  return keyPaths.reduce(function(memo, keyPath) {
    return set(memo, keyPath, get(object, keyPath))
  }, seed || {})
}

export default function() {
  /**
   * Memoize a computation of a fragment of application state.
   * This may be referenced when computing properties or querying
   * state within Presenters.
   */
  Microcosm.prototype.index = function(name, fragment, ...processors) {
    let keyPaths = getKeyPaths(fragment)

    let state = null
    let subset = null
    let answer = null

    var query = (...extra) => {
      if (this.state !== state) {
        state = this.state

        let next = extract(state, keyPaths, subset)

        if (next !== subset) {
          subset = next

          answer = processors.reduce((value, fn) => {
            return fn.call(this, value, state)
          }, subset)
        }
      }

      return extra.reduce((value, fn) => {
        return fn.call(this, value, state)
      }, answer)
    }

    this.indexes = set(this.indexes, name, query)

    return query
  }

  Microcosm.prototype.lookup = function(name) {
    let index = get(this.indexes, name, null)

    if (index == null) {
      if (this.parent) {
        return this.parent.lookup(name)
      } else {
        throw new TypeError('Unable to find missing index ' + name)
      }
    }

    return index
  }

  /**
   * Invoke an index, optionally adding additional processing.
   */
  Microcosm.prototype.compute = function(name, ...processors) {
    return this.lookup(name)(...processors)
  }

  /**
   * Return a memoized compute function. This is useful for repeated
   * invocations of a computation as state changes. Useful for use inside
   * of Presenters.
   */
  Microcosm.prototype.memo = function(name, ...processors) {
    let index = this.lookup(name)

    let last = null
    let answer = null

    return () => {
      let next = index()

      if (next !== last) {
        last = next
        answer = index(...processors)
      }

      return answer
    }
  }
}
