import uid from 'uid'
import Lists from './lists'
import Collection from './collection'

class Items extends Collection {
  static create(params) {
    return { id: uid(), ...params }
  }

  static destroy(id) {
    return id
  }

  getInitialState() {
    return []
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
