/**
 * Children
 * Get all children of a list
 */

export default function (items=[], parent) {
  return items.filter(i => i.list === parent.id)
}
