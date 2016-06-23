import Circle    from './stores/Circle'
import Microcosm from '../../../src/microcosm'

export default class SimpleSVG extends Microcosm {

  constructor() {
    super()
    this.addStore('circle', Circle)
  }

}
