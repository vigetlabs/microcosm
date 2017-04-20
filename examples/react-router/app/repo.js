import Microcosm from 'microcosm'
import Items from './domains/items'
import Lists from './domains/lists'

export default class Repo extends Microcosm {
  setup() {
    this.addDomain('lists', Lists)
    this.addDomain('items', Items)
  }
}
