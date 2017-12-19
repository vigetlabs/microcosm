/**
 * @flow
 */

export class Warehouse {
  constructor() {
    this._bank = new Map()
  }

  has(action) {
    return this._bank.has(action)
  }

  set(action, repo, payload) {
    this._ensure(action)

    return this._bank.get(action).set(repo, payload)
  }

  get(action, repo) {
    if (!action) {
      return {}
    }

    this._ensure(action, repo)

    return this._bank.get(action).get(repo)
  }

  delete(action) {
    this._bank.delete(action)
  }

  get size() {
    return this._bank.size
  }

  /* Private ------------------------------------------------------ */

  _ensure(action, repo) {
    if (this._bank.has(action) === false) {
      this._bank.set(action, new Map([[repo, {}]]))
    }
  }
}
