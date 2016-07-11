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
    test(app, params) {
      t.is(params, true)
    }
    render() {
      return <View />
    }
  }

  mount(<MyPresenter app={ new Microcosm() } />).find(View).simulate('click')
})

test('throws if no presenter implements an intent', t => {
  class MyPresenter extends Presenter {
    render() {
      return <View />
    }
  }
  
  t.throws(function() {
    mount(<MyPresenter app={ new Microcosm() } />).find(View).simulate('click')
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

  const app = new Microcosm()
  const presenter = mount(<MyPresenter app={ app } />)

  app.replace({ color: 'red' })

  t.is(presenter.state('color'), 'red')
})

test('send bubbles up to parent presenters', t => {
  t.plan(1)

  class Child extends Presenter {
    render() {
      return <View />
    }
  }

  class Parent extends Presenter {
    test(app, params) {
      t.is(params, true)
    }
    render() {
      return <Child />
    }
  }

  mount(<Parent app={ new Microcosm() } />).find(View).simulate('click')
})
