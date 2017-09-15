/**
 * @flow
 */
import { get, isFunction } from './utils'

const $Symbol = isFunction(Symbol) ? Symbol : /* istanbul ignore next */ {}

export const toStringTag: * = get($Symbol, 'toStringTag', '@@toStringTag')

export const iteratorTag: * = get($Symbol, 'iterator', '@@iterator')
