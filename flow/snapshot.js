/**
 * @fileoverview A snapshot is a reference to a specific dispatch for
 * a given action. A microcosm instance maintains a bank of them to
 * efficiently update state.
 * @flow
 */

type Snapshot = {
  last: *,
  next: *,
  status: Status,
  payload: *
}
