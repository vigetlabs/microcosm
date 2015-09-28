import React from 'react'
import UndoTree from './undo-tree'

const Drawing = React.createClass({

  getDefaultProps() {
    return {
      height: 400,
      width: 400
    }
  },

  getRow(row, y) {
    return row.map(function(cell, x) {
      return (<rect key={ x + "." + y }
                    x={ x }
                    y={ y }
                    onClick={ e => this.props.onClick([ x, y ]) }
                    fill={ cell ? 'black' : 'white' }
                    stroke="black"
                    strokeOpacity="0.2"
                    strokeWidth="0.005"
                    width="1"
                    height="1"/>)
    }, this)
  },

  render() {
    let { app, pixels, width, height } = this.props

    let scaleX = width / pixels[0].length
    let scaleY = height / pixels.length

    return (
      <div>
        <svg width={ this.props.width } height={ this.props.height }>
          <g transform={ `scale(${ scaleX }, ${ scaleY })` }>
             { pixels.map(this.getRow) }
           </g>
        </svg>

        <UndoTree history={ app.history } onNodeClick={ node => app.goto(node) }/>

        <div>
          <button onClick={ () => app.undo() }>Undo</button>
        </div>
      </div>
    )
  }
})

export default Drawing
