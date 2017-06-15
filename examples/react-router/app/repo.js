import Microcosm from 'microcosm'
import Items from './domains/items'
import Lists from './domains/lists'
import Routing from './effects/routing'

export default class Repo extends Microcosm {
  setup({ browserHistory }) {
    this.addDomain('lists', Lists)
    this.addDomain('items', Items)

    this.addEffect(Routing, { history: browserHistory })
  }
}
