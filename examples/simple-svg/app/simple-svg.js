import Circle    from './stores/Circle'
import Microcosm from '../../../src/Microcosm'

export default class SimpleSVG extends Microcosm {

  constructor() {
    super()
    this.addStore('circle', Circle)
  }

}
