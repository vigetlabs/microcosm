import uid from 'uid'
import Domain from './domain'

class Lists extends Domain {
  static create(params) {
    return { id: uid(), ...params }
  }

  static destroy(id) {
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
