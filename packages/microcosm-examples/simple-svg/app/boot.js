import DOM from 'react-dom'
import React from 'react'
import Microcosm from 'microcosm'
import Presenter from 'microcosm/addons/presenter'
import Circle from './domains/circle'
import Logo from './views/logo'
import { animate } from './actions/animate'

class LogoPresenter extends Presenter {
  getModel() {
    return {
      circle: state => state.circle
    }
  }

  setup(repo) {
    repo.addDomain('circle', Circle)
  }

  loop({ time }) {
    this.repo.push(animate, time).onDone(this.loop, this)
  }

  ready(repo) {
    this.loop({ time: Date.now() })
  }

  render() {
    return <Logo circle={this.model.circle} />
  }
}

DOM.render(
  <LogoPresenter repo={new Microcosm({ batch: true })} />,
  document.getElementById('app')
)

if (module.hot) {
  module.hot.accept()
}
