/**
 * @flow
 */

import type Microcosm from '../src/microcosm'
import type Action from '../src/action'

declare interface Effect {
  actions: Object,

  /**
   * Setup runs right after an effect is added to a Microcosm. It
   * receives that repo and any options passed as the second argument.
   */
  setup(repo: Microcosm, options: ?Object): void,

  /**
   * Runs whenever a Microcosm is torn down. This usually happens when
   * a Presenter component unmounts. Useful for cleaning up work done
   * in `setup()`.
   */
  teardown(repo: Microcosm): void,

  /**
   * Returns an object mapping actions to methods on the effect. This is the
   * communication point between a effect and the rest of the system.
   */
  register(): {
    [any]: (repo: Microcosm, action: Action) => void
  }
}
