/**
 * @flow
 */

import uid from 'uid'
import Domain from './domain'

export type List = {
  id?: string,
  name: string
}

class Lists extends Domain {
  static create(params): List {
    return { id: uid(), ...params }
  }

  static destroy(id: string) {
    return id
  }

  register() {
    return {
      [Lists.create]: this.add,
      [Lists.destroy]: this.remove
    }
  }
}

export default Lists
