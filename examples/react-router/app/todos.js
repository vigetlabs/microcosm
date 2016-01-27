import Microcosm from '../../../src/Microcosm'
import ItemStore from './resources/items/store'
import ListStore from './resources/lists/store'

class Todos extends Microcosm {

  constructor() {
    super()

    // Stores modify a global application state object
    // Dispatching actions occurs in the order specified
    // here:

    // 1. Lists
    this.addStore('lists', ListStore)

    // 2. List Items
    this.addStore('items', ItemStore)
  }

}

export default Todos
