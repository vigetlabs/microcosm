/**
 * @fileoverview A snapshot is a reference to a specific dispatch for
 * a given action. A microcosm instance maintains a bank of them to
 * efficiently update state.
 * @flow
 */

type State = { [key: string]: * }

declare type Snapshot = {
  // The last state the snapshot was dispatched with. This is used
  // to memoize domain handlers when possible.
  last: State,
  // The next state for the snapshot. The outcome of `updateSnapshot`.
  next: State,
  // Last known status of the action associated with this snapshot.
  status: Status,
  // Last known payload of the action associated with this snapshot.
  payload: any
}
