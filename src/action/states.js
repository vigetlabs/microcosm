/**
 * actions can be in multiple states, depending on how their behaviors
 * evaluate.
 *
 * important: the numbers here matter. they must be powers of 2. an action's
 * `state` property is a bitmask of these state values.
 */

export default {
  // nothing has happened yet. the action has not executed.
  unset : 1,

  // execution has started, but there has been no update. for example,
  // an xhr request has started but hasn't received an answer.
  open : 2,

  // progress. this state represents partial loading of an xhr
  // request, or incomplete transfer from a stream, etc.
  loading : 4,

  // the action has resolved.
  done : 8,

  // the action has failed
  failed : 16,

  // prevent the action from dispatching to stores. this is used by
  // the microcosm debugger to toggle actions within the history tree.
  disabled : 32,

  // the action was cancelled. for example, you could use this state to
  // handle an aborted xhr request.
  cancelled : 64,

  // the action is disposable. this marks the action for cleanup
  // within a microcosm's history tree.
  disposable : 128
}
