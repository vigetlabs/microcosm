/**
 * @flow
 */

import assert from 'assert'
import { Subject } from './subject'
import { EMPTY_OBJECT, EMPTY_ARRAY } from './empty'
import { RESET, PATCH } from './lifecycle'
import { Agent } from './agent'
import { Tree } from './tree'

type DomainHandler<State> = (state: State, payload?: *, meta?: *) => State

const RESET_KEY = RESET.toString()
const PATCH_KEY = PATCH.toString()

export class Domain<State: any = Object> extends Agent {
  history: Tree

  constructor(repo: *, options?: Object) {
    super(repo, options)

    this.history = new Tree(this.options)
    this.next(this.getInitialState())
  }

  /**
   * Generate the starting value for the domain.
   */
  getInitialState(): State {
    return EMPTY_OBJECT
  }

  /**
   * Allows a domain to transform state into a JavaScript primitive
   * suitable for serialization into JSON. Usually during server-side
   * rendering.
   *
   * To prevent accidental data transfer, this method is "opt-in",
   * returning `undefined` by default.
   */
  serialize(state: State): * {}

  /**
   * Allows data to be transformed into a valid shape before it enters a
   * Microcosm. This is the reverse operation to `serialize`.
   */
  deserialize(data: *): State {
    return data
  }

  receive(action): void {
    this.history.append(action)

    action
      .every()
      .filter(this._shouldRollforward, this)
      .subscribe(this._rollforward.bind(this))
  }

  // Private -------------------------------------------------- //

  toJSON() {
    return this.serialize(this.valueOf())
  }

  _resolve(action: Subject): DomainHandler<State>[] {
    switch (action.meta.key) {
      case RESET_KEY:
      case PATCH_KEY:
        // If a domain's state is patched, the state of all prior actions
        // will always be overridden. There is no reason to process them.
        // Unfortunately we can't do anything about this until Domains manage
        // their own history (assuming this is a good idea)
        // TODO: Should domains manage their own history?
        // https://github.com/vigetlabs/microcosm/issues/507
        return action.status === 'complete' ? [this._patch] : EMPTY_ARRAY
      default:
        return this.registry.resolve(action)
    }
  }

  _dispatch(state: State, action: Subject): State {
    let handlers = this._resolve(action)

    for (var i = 0, len = handlers.length; i < len; i++) {
      state = handlers[i].call(this, state, action.payload, action.meta)
    }

    return state
  }

  _shouldRollforward(action) {
    return this.history.hasValue(action) || this._resolve(action).length > 0
  }

  _rollforward(action: Subject): State {
    let focus = action
    let state = this.history.recall(action, this.getInitialState())

    while (focus) {
      if (!focus.disabled) {
        state = this._dispatch(state, focus)
        this.history.set(focus, state)
      }

      if (focus == this.history.head) {
        break
      }

      focus = this.history.after(focus)
    }

    if (action.complete) {
      this.history.archive()
    }

    if (this.payload !== state) {
      this.next(state)
    }
  }

  _patch(state: State, payload: *, meta: *): State {
    if (this.repo !== meta.origin) {
      return state
    }

    let { deserialize, data } = payload
    let { key } = this.options

    assert(
      meta.status === 'complete',
      'Unable to reset or patch from incomplete action. This is an internal Microcosm error.'
    )

    assert(
      data,
      'Unable to reset or patch, no data provided. This is an internal Microcosm error.'
    )

    let value = data[key]

    if (value != null) {
      return deserialize ? this.deserialize(value) : value
    }

    return this.getInitialState()
  }

  _shouldListenTo(action: Subject): boolean {
    switch (action.meta.key) {
      case RESET_KEY:
      case PATCH_KEY:
        return true
      default:
        return this.registry.respondsTo(action)
    }
  }
}
