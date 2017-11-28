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
  start: 'start',
  next: 'next',
  complete: 'complete',
  error: 'error'
}

export default STATUS
