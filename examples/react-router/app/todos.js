import Microcosm from '../../../src/microcosm'
import Items     from './stores/items'
import Lists     from './stores/lists'

export default class Todos extends Microcosm {

  setup() {
    // 1. Lists
    this.addStore('lists', Lists)

    // 2. List Items
    this.addStore('items', Items)
  }

}
