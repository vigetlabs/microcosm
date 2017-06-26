/**
 * @flow
 */

import type Microcosm from '../src/microcosm'
import type Registration from '../src/registration'

declare type Handler = <T>(last?: T, next?: *) => T

declare type Registrations = Array<Registration>
