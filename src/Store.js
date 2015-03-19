/**
 * Store
 * The basic state container for Microcosm. Store observes
 * changes, by assignment, to an immutable data structure.
 */

export default class Store {

  constructor(constants, seed) {
    this._tasks = this.register(constants)
    this.state  = this.getInitialState(seed)
  }

  getInitialState() {
    // noop
  }

  register() {
    // noop
  }

  send({ type, body }) {
    if (this._tasks && type in this._tasks) {
      this._tasks[type].call(this, body)
    }
  }

  toJSON() {
    return this.state
  }

  serialize() {
    return undefined
  }
}
