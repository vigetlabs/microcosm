import React     from 'react'
import Presenter from 'microcosm/addons/presenter'
import Canvas    from '../views/canvas'
import {paint}   from '../actions/pixels'

class Workspace extends Presenter {

  viewModel() {
    return {
      pixels : state => state.pixels
    }
  }

  paint(x, y) {
    return this.app.push(paint, x, y)
  }

  render() {
    return <Canvas pixels={ this.state.pixels } onClick={ this.paint.bind(this) } />
  }

}

export default Workspace
