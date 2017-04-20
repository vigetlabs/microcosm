import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import Canvas from './canvas'

class Workspace extends Presenter {
  getModel() {
    return {
      pixels: state => state.pixels
    }
  }

  render() {
    return <Canvas pixels={this.model.pixels} />
  }
}

export default Workspace
