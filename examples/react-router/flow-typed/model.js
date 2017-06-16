/**
 * @flow
 */

import Microcosm from '../../../src/microcosm'
import Presenter from '../../../src/addons/presenter'

type Snapshot = { [string]: * }

declare interface Model {
  call(presenter: Presenter, state: Snapshot, repo: Microcosm): *
}
