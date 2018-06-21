/**
 * @fileoverview An agent is a general abstraction for intercepting actions.
 * It is the basis of Domain and Effect
 * @flow
 */

import { Registry } from './registry'
import { Subject } from './subject'
import { merge } from './data'
import { EMPTY_OBJECT } from './empty'

export class Agent extends Subject {
  repo: *
  options: Object

  static defaults: ?Object

  constructor(repo: *, options?: Object) {
    super(null, options)

    this.repo = repo
    this.options = merge(repo.options, this.constructor.defaults, options)
    this.registry = new Registry(this)

    this.repo.dispatcher
      .filter(this._shouldListenTo, this)
      .subscribe(this.receive.bind(this))

    repo.subscribe({
      complete: this.teardown.bind(this, this.repo, this.options)
    })

    this.setup(this.repo, this.options)
  }

  /**
   * Setup runs right after an agent is added to a Microcosm. It
   * receives that repo and any options passed as the second argument.
   */
  setup(repo?: *, options?: Object): void {}

  /**
   * Runs whenever a Microcosm is torn down. This usually happens when
   * a Presenter component unmounts. Useful for cleaning up work done
   * in `setup()`.
   */
  teardown(repo?: *, options?: Object): void {}

  /**
   * Returns an object mapping actions to methods on the agent. This is the
   * communication point between a agentand the rest of the system.
   */
  register(): * {
    return EMPTY_OBJECT
  }

  /**
   * Called whenever an agent receives a new action
   */
  receive(action: Subject): void {}

  // Private -------------------------------------------------- //

  _shouldListenTo(action: Subject): boolean {
    return this.registry.respondsTo(action)
  }
}
