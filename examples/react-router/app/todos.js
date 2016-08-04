import Microcosm from '../../../src/microcosm'
import Items     from './domains/items'
import Lists     from './domains/lists'

export default class Todos extends Microcosm {

  setup() {
    // 1. Lists
    this.addDomain('lists', Lists)

    // 2. List Items
    this.addDomain('items', Items)
  }

}
