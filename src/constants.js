/**
 * Tasks move through a specific set of states. This module controls
 * how they should behave.
 */

export const STATES = {}

/**
 * Inactive state. This is the starting state of an task
 */
STATES['inactive'] = { disposable: false, once: true,  listener: 'onStart' }

/**
 * Open state. The task has started, but has received no response
 */
STATES['open'] = { disposable: false, once: true,  listener: 'onOpen' }

/**
 * Update state. The task has received an update, such as loading progress.
 */
STATES['update'] = { disposable: false, once: false, listener: 'onUpdate' }

/**
 * Resolved state. The task has completed successfully.
 */
STATES['resolve'] = { disposable: true,  once: true,  listener: 'onDone' }

/**
 * Failure state. The task did not complete successfully.
 */
STATES['reject'] = { disposable: true,  once: true,  listener: 'onError' }

/**
 * Cancelled state. The task was halted, like aborting an HTTP request.
 */
STATES['cancel'] = { disposable: true,  once: true,  listener: 'onCancel' }


// For nested registrations, track our aliases
export const ALIASES = {
  inactive  : 'inactive',
  open      : 'open',
  update    : 'loading',
  loading   : 'update',
  done      : 'resolve',
  resolve   : 'done',
  reject    : 'error',
  error     : 'reject',
  cancel    : 'cancelled',
  cancelled : 'cancel'
}
