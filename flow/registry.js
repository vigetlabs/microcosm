/**
 * @flow
 * eslint-disable
 */

import type Microcosm from '../src/microcosm'
import type Registration from '../src/registration'

declare type Handler = (last?: *, next?: *) => mixed

declare type Registrations = Array<Registration>

declare interface Registerable {
  register(): Registrations,

  setup(repo: Microcosm, options: ?Object): void,

  teardown(repo: Microcosm): void
}
