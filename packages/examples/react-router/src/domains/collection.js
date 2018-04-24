import { Domain } from 'microcosm'
import { find, filter } from 'lodash'

class Collection extends Domain {
  getInitialState() {
    return []
  }

  add(items, params) {
    return items.concat(params)
  }

  remove(items, unwanted) {
    return items.filter(i => i.id !== unwanted)
  }

  removeBy(key) {
    return (items, value) => {
      return items.filter(item => item[key] !== value)
    }
  }

  find(matching) {
    return this.map(items => find(items, matching))
  }

  filter(matching) {
    return this.map(items => filter(items, matching))
  }
}

export default Collection
