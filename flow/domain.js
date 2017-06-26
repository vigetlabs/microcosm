/**
 * @fileoverview Domains define the rules in which resolved actions are
 * converted into new state. They are added to a Microcosm instance
 * using `addDomain`.
 * @flow
 */

import type Microcosm from '../src/microcosm'

declare interface Domain {
  /**
   * Generate the starting value for the particular state this domain is
   * managing. This will be called by the Microcosm using this domain when
   * it is started.
   */
  getInitialState(): *,

  /**
   * Setup runs right after a domain is added to a Microcosm, but
   * before it runs getInitialState. This is useful for one-time setup
   * instructions.
   */
  setup(repo: Microcosm, options: ?Object): void,

  /**
   * Runs whenever a Microcosm is torn down. This usually happens when
   * a Presenter component unmounts. Useful for cleaning up work done
   * in `setup()`.
   */
  teardown(repo: Microcosm): void,

  /**
   * Allows a domain to transform data before it leaves the system. It
   * gives the domain the opportunity to reduce non-primitive values
   * into JSON.
   */
  serialize(state: *): *,

  /**
   * Allows data to be transformed into a valid shape before it enters a
   * Microcosm. This is the reverse operation to `serialize`.
   */
  deserialize(data: *): *,

  /**
   * Returns an object mapping actions to methods on the domain. This is the
   * communication point between a domain and the rest of the system.
   */
  register(): {
    [any]: (last?: *, next?: *) => *
  }
}
