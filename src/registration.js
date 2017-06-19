/**
 * @flow
 */

import { type KeyPath } from './key-path'

class Registration {
  key: KeyPath
  domain: Registerable
  handler: Handler

  constructor(key: KeyPath, domain: Registerable, handler: Handler) {
    this.key = key
    this.domain = domain
    this.handler = handler
  }
}

export default Registration
