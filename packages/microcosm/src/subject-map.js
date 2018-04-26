/*
 * @flow
 */

import { Subject } from './subject'
import { set } from './data'
import { isObject, isPlainObject } from './type-checks'
import { EMPTY_OBJECT, EMPTY_ARRAY } from './empty'

export class SubjectMap extends Subject {
  jobs: number

  constructor(object: *) {
    super()

    let isArray = Array.isArray(object)
    let isPojo = isPlainObject(object)

    if (!isArray && !isPojo) {
      return Subject.from(object)
    }

    this.jobs = 0
    this.payload = isArray ? EMPTY_ARRAY : EMPTY_OBJECT

    let keys = Object.keys(object)
    for (let i = 0, len = keys.length; i < len; i++) {
      this.link(keys[i], object[keys[i]])
    }

    if (this.jobs <= 0) {
      this.complete()
    }
  }

  link(key: string, value: any) {
    if (!isObject(value)) {
      this.payload = set(this.payload, key, value)
    } else {
      this.jobs += 1

      if (value instanceof Subject) {
        this.payload = set(this.payload, key, value.valueOf())
      }

      let subscription = new SubjectMap(value).subscribe(
        // Next
        this.set.bind(this, key),
        // Error
        this.error,
        // Complete
        this.unlink.bind(this),
        // Cancel
        this.unlink.bind(this)
      )

      this.subscribe({ cancel: subscription.unsubscribe })
    }
  }

  unlink() {
    this.jobs -= 1

    if (this.jobs <= 0) {
      if (this.status === 'start') {
        this.next(this.payload)
      }

      this.complete()
    }
  }

  set(key: string, value: *) {
    let payload = set(this.payload, key, value)

    if (payload !== this.payload) {
      this.next(payload)
    }
  }
}
