import Microcosm from 'Microcosm'
import React from 'react'
import Drawing from './components/drawing'

class UndoTree extends Microcosm {

  shouldHistoryKeep(transaction) {
    return true
  }

  undo() {
    this.history.back()
    this.rollforward()
  }

  goto(node) {
    this.history.setFocus(node)
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
        pixels[y][x] = pixels[y][x] ? 0 : 1
        return pixels
      }
    }
  }

})

let el  = document.getElementById('app')

function render () {
  React.render(<Drawing app={ app } { ...app.state } onClick={ app.prepare(report) }/>, el)
}

app.listen(render)
app.start(render)
