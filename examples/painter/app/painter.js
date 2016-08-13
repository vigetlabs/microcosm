import Microcosm from '../../../src/microcosm'
import Pixels    from './stores/pixels'

export default class Painter extends Microcosm {
  constructor(options) {
    super(options)

    this.addStore('pixels', Pixels)
  }
}
