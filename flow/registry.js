/**
 * @flow
 */

import type Microcosm from '../src/microcosm'
import { type KeyPath } from '../src/key-path'

declare type Handler = (last?: *, next?: *) => *

declare type Registration = {
  key: KeyPath,
  source: Microcosm | Domain,
  handler: Handler
}

declare type Registrations = Registration[]
