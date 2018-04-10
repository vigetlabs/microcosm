/**
 * @fileoverview An agent is a general abstraction for intercepting actions.
 * It is the basis of Domain and Effect
 * @flow
 */

import { type Microcosm } from '../src/microcosm'
import { EMPTY_OBJECT } from './empty'
import { Subject } from './subject'

export class Agent extends Subject {
  repo: Microcosm
  options: Object

  constructor(repo: Microcosm, options: Object) {
    super(null, options)

    this.repo = repo
    this.options = options

    let tracker = repo.history.subscribe(this.receive.bind(this))

    repo.subscribe({
      complete: () => {
        tracker.unsubscribe()
        this.teardown(repo, options)
      }
    })

    this.setup(repo, options)
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
  receive(action) {
    // do nothing
  }
}
