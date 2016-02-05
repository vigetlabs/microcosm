/**
 * All promises are wrapped in a try/catch. Normally, you
 * want this. It is very important for operations that run
 * the risk of failure, such as writing to localStorage, to
 * reject the Promise. Rejection is better than raising an
 * exception in these circumstances.
 *
 * However there comes a time when you are *done* with a
 * Promise, yet this try/catch leaks out into other branches
 * of code. This is bad: JavaScript's permissive try/catch
 * which also traps runtime errors like bad syntax.
 *
 * We want to avoid this for operations internal to Microcosm,
 * like dispatching an action when it finishes resolving. The
 * outside world does not care about these things, only that
 * pushing an action succeeded or failed.
 *
 * Additionally, we absolutely must know about exceptions that
 * are raised within Microcosm, store handlers, and plugin handlers.
 *
 * In this function we attempt to execute a callback and, if it
 * fails, we eventually throw the error using setTimeout. This
 * circumvents a Promise's try/catch because setTimeout pushes
 * its callback into a completely new callstack on the next cycle
 * of the JavaScript runtime loop.
 *
 * This has no effect on callbacks outside of Microcosm, since the
 * chain of callbacks is never returned.
 *
 * @param {Promise} promise - The promise to escape out of.
 * @param {Function} callback - The error-first callback to execute.
 *
 * @returns undefined
 */

import eventually from './eventually'

export default function liftCallback (promise, callback) {

  function success (body) {
    callback(null, body)
  }

  function failure (error) {
    callback(error || new Error('Rejected Promise'), null)
  }

  promise.then(success, failure).catch(eventually.throws)
}
