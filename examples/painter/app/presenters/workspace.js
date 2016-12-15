import Presenter from 'microcosm/addons/presenter'
import Canvas    from '../views/canvas'

class Workspace extends Presenter {
  view = Canvas

  model () {
    return {
      pixels : state => state.pixels
    }
  }
}

export default Workspace
