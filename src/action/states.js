/**
 * actions can be in multiple states, depending on how their behaviors
 * evaluate.
 *
 * important: the numbers here matter. they must be powers of 2. an action's
 * `state` property is a bitmask of these state values.
 */

// Ignore this action.
export const disabled = 2

// Execution has started, but there has been no update.
export const open = 4

// Progress. This state represents partial loading of an xhr
// request, or incomplete transfer from a stream, etc.
export const loading = 8

// The action has resolved.
export const done = 16

// The action has failed
export const error = 32

// The action was cancelled. for example, you could use this state to
// handle an aborted xhr request.
export const cancelled = 64

// The action is ready for clean up
export const disposable = 128

/**
 * Check the state of the action to determine what `type` should be
 * dispatched to domains for processing (via register()).
 *
 * @private
 * @param {Action} action - The action to analyze
 * @return {String|Null} The action type to dspatch.
 */
export function getType (action) {
  let behavior = action.behavior

  if (action.is(disabled)) {
    return null
  }

  if (action.is(cancelled)) {
    return behavior.cancelled
  }

  if (action.is(error)) {
    return behavior.error
  }

  if (action.is(done)) {
    return behavior.done
  }

  if (action.is(loading)) {
    return behavior.loading
  }

  if (action.is(open)) {
    return behavior.open
  }

  return null
}
