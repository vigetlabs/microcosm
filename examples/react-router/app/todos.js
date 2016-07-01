import Microcosm from 'microcosm'
import Items     from './stores/items'
import Lists     from './stores/lists'

class Todos extends Microcosm {

  constructor(options) {
    super(options)

    // Stores modify a global application state object
    // Dispatching actions occurs in the order specified
    // here:

    // 1. Lists
    this.addStore('lists', Lists)

    // 2. List Items
    this.addStore('items', Items)
  }

}

export default Todos
