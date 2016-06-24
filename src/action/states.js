/**
 * Actions can be in multiple states, depending on how their behaviors
 * evaluate.
 *
 * Important: The numbers here matter. They must be powers of 2. An action's
 * `state` property is a bitmask of these state values.
 */
export default {
  // Nothing has happened yet. The action has not executed.
  UNSET : 1,

  // Execution has started, but there has been no update. For example,
  // an XHR request has started but hasn't received an answer.
  OPEN : 2,

  // Progress. This state represents partial loading of an XHR
  // request, or incomplete transfer from a stream, etc.
  LOADING : 4,

  // The action has resolved.
  DONE : 8,

  // The action has failed
  FAILED : 16,

  // Prevent the action from dispatching to stores. This is used by
  // the microcosm debugger to toggle actions within the history tree.
  DISABLED   : 32,

  // The action was cancelled. For example, you could use this state to
  // handle an aborted XHR request.
  CANCELLED  : 64,

  // The action is disposable. This marks the action for cleanup
  // within a microcosm's history tree.
  DISPOSABLE : 128
}
