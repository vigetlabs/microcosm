import Microcosm from '../../../src/Microcosm'
import Pixels    from './stores/pixels'

export default class UndoTree extends Microcosm {

  constructor() {
    super({ maxHistory: Infinity })
    this.addStore('pixels', Pixels)
  }

  undo() {
    this.history.tree.back()
    this.rollforward()
  }

  redo() {
    this.history.tree.forward()
    this.rollforward()
  }

  goto(node) {
    this.history.tree.checkout(node)
    this.rollforward()
  }

}
