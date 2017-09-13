import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import Layout from '../views/layout'

class Application extends Presenter {
  getModel() {
    return {
      history: state => state.history,
      snapshot: state => state.snapshot
    }
  }

  render() {
    const { history, snapshot } = this.model

    return <Layout history={history} snapshot={snapshot} />
  }
}

export default Application
