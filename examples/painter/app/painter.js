import Microcosm from '../../../src/microcosm'
import Pixels    from './domains/pixels'

export default class Painter extends Microcosm {
  setup () {
    this.addDomain('pixels', Pixels)
  }
}
