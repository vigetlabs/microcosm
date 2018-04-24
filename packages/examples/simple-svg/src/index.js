import DOM from 'react-dom'
import React from 'react'
import Circle from './domains/circle'
import Logo from './views/logo'
import { Presenter } from 'microcosm-dom'
import { animate } from './actions/animate'

class LogoPresenter extends Presenter {
  getModel(repo) {
    return {
      circle: repo.domains.circle
    }
  }

  setup(repo) {
    repo.addDomain('circle', Circle)
  }

  ready(repo) {
    this.loop()
  }

  loop = () => {
    this.repo.push(animate, 3000).subscribe({ complete: this.loop })
  }

  render() {
    return <Logo circle={this.model.circle} />
  }
}

DOM.render(<LogoPresenter />, document.getElementById('app'))

if (module.hot) {
  module.hot.accept()
}
