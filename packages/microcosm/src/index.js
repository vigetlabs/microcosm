import { Observable } from './observable'
import Subject from './subject'
import History from './history'
import Microcosm from './microcosm'
import getRegistration from './get-registration'
import tag from './tag'
import { clone, merge, get, set, update, result } from './utils'
import { RESET, PATCH } from './lifecycle'

export {
  Microcosm as default,
  Microcosm,
  History,
  Observable,
  Subject,
  tag,
  get,
  set,
  update,
  merge,
  clone,
  result,
  getRegistration,
  RESET as reset,
  PATCH as patch
}
