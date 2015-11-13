import Microcosm  from '../../../src/Microcosm'
import React      from 'react'
import DOM        from 'react-dom'
import Drawing    from './components/drawing'
import { update } from 'sprout-data'

class UndoTree extends Microcosm {

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

let app = new UndoTree()

function report(x, y) {
  return { x, y }
}

app.addStore('pixels', {

  getInitialState() {
    return Array(15).join().split(',').map(_ => Array(15).join().split(','))
  },

  register() {
    return {
      [report](pixels, { x, y }) {
        return update(pixels, [y, x], val => val ? 0 :  1)
      }
    }
  }

})

let el  = document.getElementById('app')

function render () {
  DOM.render(<Drawing app={ app } { ...app.state } onClick={ app.prepare(report) }/>, el)
}

app.listen(render)
app.start(render)
