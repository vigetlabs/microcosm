import uid from 'uid'
import Lists from './lists'
import Domain from './domain'

class Items extends Domain {
  static create(params) {
    return { id: uid(), ...params }
  }

  static destroy(id) {
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
