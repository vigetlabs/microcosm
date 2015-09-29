import React from 'react'

const Canvas = React.createClass({

  getDefaultProps() {
    return {
      pixels : [],
      height : 400,
      width  : 400
    }
  },

  getRow(row, y) {
    return row.map(function(cell, x) {
      return (<rect key={ x + "." + y } x={ x } y={ y } onClick={ e => this.props.onClick([ x, y ]) } fill={ cell ? 'black' : 'white' } width="1" height="1"/>)
    }, this)
  },

  render() {
    let { pixels, width, height } = this.props

    let scaleX = width / pixels[0].length
    let scaleY = height / pixels.length

    return (
      <svg width={ width } height={ height }>
        <g transform={ `scale(${ scaleX }, ${ scaleY })` } stroke="black" strokeWidth={ 0.25 / scaleX } strokeOpacity="0.2">
          { pixels.map(this.getRow) }
        </g>
      </svg>
    )
  }
})

export default Canvas
