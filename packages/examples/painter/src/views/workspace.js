import React from 'react'
import { Presenter } from 'microcosm-dom'
import Canvas from './canvas'

class Workspace extends Presenter {
  getModel(repo) {
    return {
      pixels: repo.domains.pixels
    }
  }

  render() {
    return <Canvas pixels={this.model.pixels} />
  }
}

export default Workspace
