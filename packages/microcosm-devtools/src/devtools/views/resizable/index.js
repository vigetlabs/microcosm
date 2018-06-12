import React, { Component } from 'react'
import css from './resizable.css'

let startX
let startWidth

class Resizable extends Component {
  state = {
    paneWidth: this.props.defaultWidth * window.innerWidth
  }

  initDrag = e => {
    this.dragging = true
    startX = e.clientX
    startWidth = this.state.paneWidth

    document.documentElement.addEventListener('mousemove', this.onDrag)
    document.documentElement.addEventListener('mouseup', this.stopDrag)
  }

  onDrag = e => {
    if (this.dragging) {
      this.setState({
        paneWidth:
          this.props.handlePosition === 'left'
            ? Math.min(startWidth - (e.clientX - startX), this.props.maxWidth)
            : Math.min(startWidth + (e.clientX - startX), this.props.maxWidth)
      })
    }
  }

  stopDrag = e => {
    this.dragging = false
  }

  render() {
    const { paneWidth } = this.state
    const { handlePosition } = this.props
    const background =
      handlePosition === 'left'
        ? 'linear-gradient(#ffffff 70%, #f9f9f9 100%)'
        : '#272d3c'

    return (
      <div
        className={css.container}
        style={{ minWidth: paneWidth, background }}
      >
        <div
          className={css.resizer}
          onMouseDown={this.initDrag}
          style={{ float: handlePosition }}
        />
        {this.props.children}
      </div>
    )
  }
}

export default Resizable
