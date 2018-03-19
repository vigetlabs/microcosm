// @flow
import { type Subject } from './subject'
import { type History } from './history'

export class Ledger<State> {
  _debug: boolean
  _history: History
  _start: State
  _versions: Map<Subject, State>

  constructor(start: State, history: History, debug: boolean) {
    this._debug = debug
    this._history = history
    this._start = start
    this._versions = new Map()
  }

  clean(action: Subject): void {
    if (action.closed && !this._debug) {
      let before = this._history.before(action)

      if (before) {
        this._versions.delete(before)
      }
    }
  }

  recall(action: ?Subject): State {
    let focus = action

    while (focus) {
      if (this._versions.has(focus)) {
        // $FlowFixMe - For whatever reason Flow thinks this might return undefined
        return this._versions.get(focus)
      }

      focus = this._history.before(focus)
    }

    return this._start
  }

  rebase(action: Subject): State {
    return this.recall(this._history.before(action))
  }

  set(action: Subject, state: *): void {
    this._versions.set(action, state)
  }

  toJSON() {
    return this.valueOf()
  }

  valueOf() {
    return this.recall(this._history.head)
  }
}
