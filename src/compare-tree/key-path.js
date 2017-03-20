const KEY_DELIMETER  = '.'
const PATH_DELIMETER = ','

import {
  castPath
} from '../utils'

function byKeyLength (a, b) {
  return a.length > b.length ? 1 : -1
}

export function getKeyString (value) {
  return value.join(KEY_DELIMETER)
}

export function getKeyPaths (value) {
  if (value == null) {
    return []
  }

  let paths = value

  if (Array.isArray(value) === false) {
    paths = `${paths}`.split(PATH_DELIMETER)
  }

  return paths.map(castPath)
}

export function getKeyStrings (array) {
  let sorted = array.slice(0).sort(byKeyLength)
  let key = ''

  for (var i = 0, len = sorted.length; i < len; i++) {
    key += i > 0 ? PATH_DELIMETER : ''
    key += getKeyString(sorted[i])
  }

  return key
}
