import Route     from './stores/Route'
import Items     from './stores/Items'
import Lists     from './stores/Lists'
import Microcosm from 'Microcosm'

class Todos extends Microcosm {

  constructor() {
    super()

    // Stores modify a global application state object
    // Dispatching actions occurs in the order specified
    // here:

    // 1. Lists
    this.addStore(Lists)

    // 2. List Items
    this.addStore(Items)

    // 3. History
    this.addStore(Route)
  }

}

export default Todos
