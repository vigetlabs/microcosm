import React      from 'react'
import Canvas     from './canvas'
import UndoTree   from './undo-tree'
import { report } from '../actions/pixels'

const Drawing = React.createClass({

  render() {
    let { app } = this.props

    return (
      <main>
        <Canvas pixels={ app.state.pixels } onClick={ app.prepare(report) }/>

        <UndoTree history={ app.history } onNodeClick={ node => app.goto(node) }/>

        <footer>
          <button onClick={ () => app.undo() }>Undo</button>
        </footer>
      </main>
    )
  }
})

export default Drawing
