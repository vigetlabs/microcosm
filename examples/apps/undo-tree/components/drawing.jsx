import React from 'react'
import Canvas from './canvas'
import UndoTree from './undo-tree'

const Drawing = React.createClass({

  render() {
    let { app, pixels } = this.props

    return (
      <main>
        <Canvas pixels={ pixels } onClick={ this.props.onClick }/>

        <UndoTree history={ app.history } onNodeClick={ node => app.goto(node) }/>

        <footer>
          <button onClick={ () => app.undo() }>Undo</button>
        </footer>
      </main>
    )
  }
})

export default Drawing
