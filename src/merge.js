/**
 * A simpler object merge. Object.assign addresses some use cases
 * we do not need, such as direct membership and the ability to merge
 * more than one object.
 */

import { isObject } from './type-checks'

export default function merge (subject, props) {
  if (isObject(props)) {
    for (var key in props) {
      subject[key] = props[key]
    }
  }

  return subject
}
