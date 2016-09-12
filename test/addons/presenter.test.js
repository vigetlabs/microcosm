import test from 'ava'
import React from 'react'
import Microcosm from '../../src/microcosm'
import Presenter from '../../src/addons/presenter'
import console from '../helpers/console'
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

test('warns if no presenter implements an intent', t => {
  class MyPresenter extends Presenter {
    render() {
      return <View />
    }
  }

  console.record()

  mount(<MyPresenter repo={ new Microcosm() } />).find(View).simulate('click')

  t.is(console.count('warn'), 1)

  console.restore()
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

test('handles non-function view model bindings', t => {
  class MyPresenter extends Presenter {
    viewModel({ name }) {
      return {
        upper: name.toUpperCase()
      }
    }
    render() {
      return <p>{this.state.upper}</p>
    }
  }

  var presenter = mount(<MyPresenter name="phil" repo={new Microcosm()} />)

  t.is(presenter.text(), 'PHIL')
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

test('runs a setup function when created', t => {
  t.plan(1)

  class MyPresenter extends Presenter {
    setup() {
      t.pass()
    }
    render() {
      return <View />
    }
  }

  mount(<MyPresenter repo={ new Microcosm() } />)
})

test('runs an update function when it gets new props', t => {
  t.plan(1)

  class MyPresenter extends Presenter {
    update(repo, props) {
      t.is(props.test, "bar")
    }
    render() {
      return <View />
    }
  }

  let wrapper = mount(<MyPresenter repo={ new Microcosm() } test="foo" />)

  wrapper.setProps({ test: "bar" })
})

test('does not run an update function when it is pure and no props change', t => {
  class MyPresenter extends Presenter {
    update(repo, props) {
      throw new Error('Presenter update method should not have been called')
    }

    render() {
      return <View />
    }
  }

  let wrapper = mount(<MyPresenter repo={ new Microcosm() } test="foo" />)

  wrapper.setProps({ test: "foo" })
})

test('always runs update when impure', t => {
  t.plan(1)

  class MyPresenter extends Presenter {
    update() {
      t.pass()
    }

    render() {
      return <View />
    }
  }

  let wrapper = mount(<MyPresenter repo={ new Microcosm() } test="foo" pure={false} />)

  wrapper.setProps({ test: "foo" })
})

test('inherits purity from repo', t => {
  t.plan(1)

  class MyPresenter extends Presenter {
    update() {
      t.pass()
    }

    render() {
      return <View />
    }
  }

  let wrapper = mount(<MyPresenter repo={ new Microcosm({ pure: false }) } test="foo" />)

  wrapper.setProps({ test: "foo" })
})

test('does not update the view model when umounted', t => {
  t.plan(1)

  class MyPresenter extends Presenter {
    // This should only run once
    viewModel() {
      t.pass()
      return {}
    }

    render() {
      return <View />
    }
  }

  let repo = new Microcosm({ pure: false })
  let wrapper = mount(<MyPresenter repo={repo} />)

  wrapper.unmount()

  repo.replace({ foo: 'bar' })
})

test('calling setState in setup does not raise a warning', t => {
  class MyPresenter extends Presenter {
    setup() {
      this.setState({ foo: 'bar' })
    }
    render() {
      return <View />
    }
  }

  console.record()

  mount(<MyPresenter repo={ new Microcosm() } />)

  t.is(console.count('warn'), 0)

  console.restore()
})
