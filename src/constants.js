/**
 * Actions move through a specific set of states. This manifest
 * controls how they should behave.
 */

export const ACTION_STATES = {
  inactive : { disposable: false, once: true,  listener: 'onInactive' },
  open     : { disposable: false, once: true,  listener: 'onOpen' },
  update   : { disposable: false, once: false, listener: 'onUpdate' },
  resolve  : { disposable: true,  once: true,  listener: 'onDone' },
  reject   : { disposable: true,  once: true,  listener: 'onError' },
  cancel   : { disposable: true,  once: true,  listener: 'onCancel' }
}

// For nested registrations, track our aliases
export const ACTION_ALIASES = {
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
