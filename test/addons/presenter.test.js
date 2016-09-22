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

test('the default render implementation passes children', t => {
  let wrapper = mount(<Presenter><p>Test</p></Presenter>)

  t.is(wrapper.text(), 'Test')
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

test('ignores an repo when it unmounts', t => {
  t.plan(1)

  const repo = new Microcosm()
  repo.off = () => t.pass()

  mount(<Presenter repo={repo} />).unmount()
})

test('does not update the view model when umounted', t => {
  t.plan(1)

  class MyPresenter extends Presenter {
    // This should only run once
    viewModel() {
      t.pass()
      return {}
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
  }

  console.record()

  mount(<MyPresenter repo={ new Microcosm() } />)

  t.is(console.count('warn'), 0)

  console.restore()
})

test('warns when setState in setup does not raise a warning', t => {
  class MyPresenter extends Presenter {
    viewModel() {
      return this.repo.state
    }
  }

  console.record()

  mount(<MyPresenter repo={ new Microcosm() } />)

  t.regex(console.last('warn'), /The view model for this presenter returned repo\.state/i)

  console.restore()
})

test('allows functions to return from viewModel', t => {
  class MyPresenter extends Presenter {
    viewModel() {
      return state => state
    }
  }

  const el = mount(<MyPresenter repo={new Microcosm()} />)

  t.is(el.state(), el.instance().repo.state)
})

test('does not cause a re-render when shallowly equal and pure', t => {
  const repo = new Microcosm({ pure: true })
  let renders = 0

  repo.replace({ name: 'Kurtz' })

  class Namer extends Presenter {
    viewModel() {
      return { name: state => state.name }
    }
    render() {
      renders += 1
      return <p>{ this.state.name }</p>
    }
  }

  mount(<Namer repo={ repo } />)

  repo.replace({ name: 'Kurtz', unrelated: true })

  t.is(renders, 1)
})

test('always re-renders impure repos', t => {
  const repo = new Microcosm({ pure: false })
  let renders = 0

  repo.replace({ name: 'Kurtz' })

  class Namer extends Presenter {
    viewModel() {
      return { name: state => state.name }
    }
    render() {
      renders += 1
      return (<p>{ this.state.name }</p>)
    }
  }

  mount(<Namer repo={ repo } />)
  repo.replace({ name: 'Kurtz', unrelated: true })
  t.is(renders, 2)
})

test('recalculates the view model if the props are different', t => {
  const repo = new Microcosm()

  repo.replace({ name: 'Kurtz' })

  class Namer extends Presenter {
    viewModel(props) {
      return {
        name: state => props.prefix + ' ' + state.name
      }
    }
    render() {
      return (<p>{ this.state.name }</p>)
    }
  }

  const wrapper = mount(<Namer prefix="Colonel" repo={repo} />)

  wrapper.setProps({ prefix: 'Captain' })

  t.is(wrapper.text(), 'Captain Kurtz')
})

test('does not recalculate the view model if the props are the same', t => {
  const repo = new Microcosm()

  t.plan(1)

  class Namer extends Presenter {
    viewModel(props) {
      t.pass()
      return {}
    }
  }

  const wrapper = mount(<Namer prefix="Colonel" repo={repo} />)

  wrapper.setProps({ prefix: 'Colonel' })
})

test('does not waste rendering on nested children', t => {
  const repo = new Microcosm()

  t.plan(2)

  class Child extends Presenter {
    viewModel() {
      return { name: state => state.name }
    }
    render() {
      t.pass()
      return <p>{ this.state.name }</p>
    }
  }

  class Parent extends Presenter {
    viewModel() {
      return { name: state => state.name }
    }
    render() {
      return <Child />
    }
  }

  mount(<Parent repo={ repo } />)
  repo.replace({ name: 'Billy Booster' })
})

test('remembers inline properties', t => {
  const repo = new Microcosm()

  class Subject extends Presenter {
    state = {
      test: true
    }
    viewModel() {
      return {
        prop: state => true
      }
    }
  }

  let wrapper = mount(<Subject repo={ repo } />)

  t.is(wrapper.state('test'), true)
})

test('does not tear down other listeners', t => {
  const repo = new Microcosm()

  class Parent extends Presenter {
    render() {
      return this.props.hide ? <p>Nothing</p> : this.props.children
    }
  }

  class Child extends Presenter {
    render() {
      return <p>Hey</p>
    }
  }

  let wrapper = mount(<Parent repo={ repo }><Child /></Parent>)

  wrapper.setProps({ hide: true })

  t.is(repo._callbacks['$change'].length, 1)
})
