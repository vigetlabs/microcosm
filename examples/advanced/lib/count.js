/**
 * Count
 * Determine the number of items a list has
 */

import children from './children'

export default function (items=[], parent) {
  return children(items, parent).length
}
