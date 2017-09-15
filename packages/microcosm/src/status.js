/**
 * These are all valid statuses for actions. Values represent
 * corresponding aliases.
 *
 * TODO: Long term, there should only be a one name for each
 * status. Consider removing aliases in a major version.
 *
 * @flow
 */

const STATUS: { [key: Status]: Status } = {
  inactive: 'inactive',
  open: 'open',
  update: 'loading',
  loading: 'update',
  done: 'resolve',
  resolve: 'done',
  reject: 'error',
  error: 'reject',
  cancel: 'cancelled',
  cancelled: 'cancel'
}

export default STATUS
