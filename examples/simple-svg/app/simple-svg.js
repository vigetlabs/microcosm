import Store     from './store'
import Microcosm from 'microcosm'

export default class SimpleSVG extends Microcosm {

  constructor() {
    super()
    this.addStore('circle', Store)
  }

}
