/**
 * @fileoverview An agent is a general abstraction for intercepting actions.
 * It is the basis of Domain and Effect
 * @flow
 */

import { type Microcosm } from '../src/microcosm'
import { Subject } from './subject'
import { merge } from './data'

export class Agent extends Subject {
  repo: Microcosm
  options: Object

  static defaults: ?Object

  constructor(repo: Microcosm, options?: Object) {
    super(null, options)

    this.repo = repo
    this.options = merge(repo.options, this.constructor.defaults, options)

    let tracker = repo.history.subscribe(this.receive.bind(this))

    repo.subscribe({
      complete: () => {
        tracker.unsubscribe()
        this.teardown(this.repo, this.options)
      }
    })

    this.setup(this.repo, this.options)
  }

  /**
   * Setup runs right after an agent is added to a Microcosm. It
   * receives that repo and any options passed as the second argument.
   */
  setup(repo?: Microcosm, options?: Object): void {}

  /**
   * Runs whenever a Microcosm is torn down. This usually happens when
   * a Presenter component unmounts. Useful for cleaning up work done
   * in `setup()`.
   */
  teardown(repo?: Microcosm, options?: Object): void {}

  /**
   * Called whenever an agent receives a new action
   */
  receive(action: Subject): void {}
}
