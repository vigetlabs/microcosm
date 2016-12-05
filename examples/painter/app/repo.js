import Microcosm from 'microcosm'
import Pixels    from './domains/pixels'

export default class Repo extends Microcosm {

  setup () {
    this.addDomain('pixels', Pixels)
  }

}
