/**
 * @flow
 */

import { observable } from './symbols'

export function isPromise(obj: any) {
  return obj && typeof obj.then === 'function'
}

export function isObservable(obj: any) {
  return obj && obj[observable]
}

export function isObject(obj: any) {
  return obj && typeof obj === 'object'
}

export function isPlainObject(obj: any) {
  return isObject(obj) && Object.getPrototypeOf(obj) === Object.prototype
}
