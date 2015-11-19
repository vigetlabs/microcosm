import Microcosm from '../../../src/Microcosm'
import Pixels    from './stores/pixels'

export default class UndoTree extends Microcosm {

  constructor() {
    super()
    this.addStore('pixels', Pixels)
  }

  shouldHistoryKeep(transaction) {
    return true
  }

  undo() {
    this.history.back()
    this.rollforward()
  }

  goto(node) {
    this.history.checkout(node)
    this.rollforward()
  }

}
