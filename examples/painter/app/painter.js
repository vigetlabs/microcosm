import Microcosm from '../../../src/Microcosm'
import Pixels    from './stores/pixels'

export default class Painter extends Microcosm {

  constructor() {
    super({ maxHistory: Infinity })
    this.addStore('pixels', Pixels)
  }

}
