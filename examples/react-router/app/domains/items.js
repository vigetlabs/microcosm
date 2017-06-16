/**
 * @flow
 */

import uid from 'uid'
import Lists from './lists'
import Domain from './domain'

export type Item = {
  id?: string,
  name: string,
  list: string
}

class Items extends Domain {
  static create(params): Item {
    return { id: uid(), ...params }
  }

  static destroy(id: string) {
    return id
  }

  register() {
    return {
      [Items.create]: this.add,
      [Items.destroy]: this.remove,
      [Lists.destroy]: this.removeBy('list')
    }
  }
}

export default Items
