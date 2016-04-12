import React     from 'react'
import Canvas    from './canvas'
import { paint } from '../actions/pixels'

const Drawing = React.createClass({

  flipBit(position) {
    return this.props.app.push(paint, position)
  },

  render() {
    let { app } = this.props

    return (
      <main>
        <Canvas pixels={ app.state.pixels } onClick={ this.flipBit }/>
      </main>
    )
  }
})

export default Drawing
