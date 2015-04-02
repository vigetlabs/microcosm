/**
 * findBy
 * Find by a given attribute. Defaults to 'id'
 */

import find from './find'

export default function (list, val, prop='id') {
  return find(list, i => i[prop] === val)
}
