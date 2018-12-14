/**
 * @flow
 */

const $Symbol = typeof Symbol === 'function' ? Symbol : {}

export const toStringTag: * = $Symbol.toStringTag || '@@toStringTag'

export const iteratorTag: * = $Symbol.iterator || '@@iterator'
