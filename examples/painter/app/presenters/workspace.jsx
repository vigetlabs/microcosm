import React     from 'react'
import Presenter from '../../../../src/addons/presenter'
import Canvas    from '../views/canvas'
import {paint}   from '../actions/pixels'

class Workspace extends Presenter {
  register () {
    return {
      paint: (repo, point) => this.repo.push(paint, point)
    }
  }

  model () {
    return {
      pixels : state => state.pixels
    }
  }

  view ({ pixels }) {
    return <Canvas pixels={pixels} />
  }
}

export default Workspace
