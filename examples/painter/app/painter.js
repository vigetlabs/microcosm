import Microcosm from '../../../src/microcosm'
import Pixels    from './domains/pixels'

export default class Painter extends Microcosm {
  constructor(options) {
    super(options)

    this.addDomain('pixels', Pixels)
  }
}
