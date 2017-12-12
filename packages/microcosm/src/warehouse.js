/**
 * @flow
 */

export class Warehouse {
  constructor() {
    this._bank = new Map()
  }

  set(action, repo, payload) {
    this._ensure(action)

    return this._bank.get(action).set(repo, payload)
  }

  get(action, repo) {
    if (!action) {
      return null
    }

    this._ensure(action, repo)

    return this._bank.get(action).get(repo)
  }

  delete(action) {
    this._bank.delete(action)
  }

  /* Private ------------------------------------------------------ */

  _ensure(action) {
    if (this._bank.has(action) === false) {
      this._bank.set(action, new Map())
    }
  }
}
