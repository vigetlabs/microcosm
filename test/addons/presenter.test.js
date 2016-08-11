import test from 'ava'
import React from 'react'
import Microcosm from '../../src/microcosm'
import Presenter from '../../src/addons/presenter'
import {mount} from 'enzyme'

const View = React.createClass({
  contextTypes: {
    send: React.PropTypes.func.isRequired
  },
  render() {
    return <button id="button" onClick={ () => this.context.send('test', true) } />
  }
})

test('requires an implementation of a render method', t => {
  t.throws(() => mount(<Presenter />), /implement a render method/)
})

test('receives intent events', t => {
  t.plan(1)

  class MyPresenter extends Presenter {
    register() {
      return {
        test(repo, params) {
          t.is(params, true)
        }
      }
    }
    render() {
      return <View />
    }
  }

  mount(<MyPresenter repo={ new Microcosm() } />).find(View).simulate('click')
})

test('throws if no presenter implements an intent', t => {
  class MyPresenter extends Presenter {
    render() {
      return <View />
    }
  }

  t.throws(function() {
    mount(<MyPresenter repo={ new Microcosm() } />).find(View).simulate('click')
  }, /implements intent/)
})

test('builds the view model into state', t => {
  class MyPresenter extends Presenter {
    viewModel() {
      return {
        color: state => state.color
      }
    }
    render() {
      return <p>{ this.state.color }</p>
    }
  }

  const repo = new Microcosm()
  const presenter = mount(<MyPresenter repo={ repo } />)

  repo.replace({ color: 'red' })

  t.is(presenter.state('color'), 'red')
})

test('throws if a presenters view model contains a non-function', t => {
  class MyPresenter extends Presenter {
    viewModel() {
      return {
        color: 'red'
      }
    }
    render() {
      return <p>{ this.state.color }</p>
    }
  }

  t.throws(function() {
    mount(<MyPresenter repo={ new Microcosm() } />)
  }, /Expected 'color' to be a function/)
})

test('send bubbles up to parent presenters', t => {
  t.plan(1)

  class Child extends Presenter {
    render() {
      return <View />
    }
  }

  class Parent extends Presenter {
    register() {
      return {
        test(repo, params) {
          t.is(params, true)
        }
      }
    }
    render() {
      return <Child />
    }
  }

  mount(<Parent repo={ new Microcosm() } />).find(View).simulate('click')
})
