/**
 * actions can be in multiple states, depending on how their behaviors
 * evaluate.
 *
 * important: the numbers here matter. they must be powers of 2. an action's
 * `state` property is a bitmask of these state values.
 */

const STATES = {
  // nothing has happened yet, or we don't want anything to happen.
  disabled : 2,

  // execution has started, but there has been no update. for example,
  // an xhr request has started but hasn't received an answer.
  open : 4,

  // progress. this state represents partial loading of an xhr
  // request, or incomplete transfer from a stream, etc.
  loading : 8,

  // the action has resolved.
  done : 16,

  // the action has failed
  failed : 32,

  // prevent the action from dispatching to stores. this is used by
  // the microcosm debugger to toggle actions within the history tree.
  cancelled : 64,

  // the action was cancelled. for example, you could use this state to
  // handle an aborted xhr request.
  disposable : 128
}

const PRIORITY = [ 'disabled', 'cancelled', 'failed', 'done', 'loading', 'open' ]

/**
 * Check the state of the action to determine what `type` should be
 * dispatched to stores for processing (via register()).
 *
 * @private
 * @return {String|Null} The action type to dspatch.
 */
export function getType (action) {
  for (var i = 0, len = PRIORITY.length; i < len; i++) {
    let type = PRIORITY[i]

    if (action.is(STATES[type])) {
      return action.behavior[type] || null
    }
  }

  return null
}

export default STATES
