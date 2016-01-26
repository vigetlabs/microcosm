import React      from 'react'
import Canvas     from './canvas'
import { report } from '../actions/pixels'

const Drawing = React.createClass({

  render() {
    let { app } = this.props

    return (
      <main>
        <Canvas pixels={ app.state.pixels } onClick={ app.prepare(report) }/>
      </main>
    )
  }
})

export default Drawing
