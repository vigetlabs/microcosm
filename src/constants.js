/**
 * Actions move through a specific set of states. This manifest
 * controls how they should behave.
 */

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
