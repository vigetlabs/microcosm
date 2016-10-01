import test from 'ava'
import React from 'react'
import Microcosm from '../../src/microcosm'
import Presenter from '../../src/addons/presenter'
import logger from '../helpers/console'
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

  logger.record()

  mount(<MyPresenter repo={ new Microcosm() } />).find(View).simulate('click')

  t.is(logger.count('warn'), 1)

  logger.restore()
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
    view({ upper }) {
      return <p>{upper}</p>
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
    view () {
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
    view() {
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

    view() {
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

    view() {
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

    view() {
      return <View />
    }
  }

  let wrapper = mount(<MyPresenter repo={ new Microcosm({ pure: false }) } test="foo" />)

  wrapper.setProps({ test: "foo" })
})

test('ignores an repo when it unmounts', t => {
  t.plan(1)

  const repo = new Microcosm()

  class Test extends Presenter {
    setup (repo) {
      repo.off = () => t.pass()
    }
  }

  mount(<Test repo={repo} />).unmount()
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

  logger.record()

  mount(<MyPresenter repo={ new Microcosm() } />)

  t.is(logger.count('warn'), 0)

  logger.restore()
})

test('warns when setState in setup does not raise a warning', t => {
  class MyPresenter extends Presenter {
    viewModel() {
      return this.repo.state
    }
  }

  logger.record()

  mount(<MyPresenter repo={ new Microcosm() } />)

  t.regex(logger.last('warn'), /The view model for this presenter returned repo\.state/i)

  logger.restore()
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
    view ({ name }) {
      renders += 1
      return <p>{ name }</p>
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
    view ({ name }) {
      renders += 1
      return (<p>{ name }</p>)
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
    viewModel (props) {
      return {
        name: state => props.prefix + ' ' + state.name
      }
    }
    view ({ name }) {
      return (<p>{ name }</p>)
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
    viewModel (props) {
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
    viewModel () {
      return { name: state => state.name }
    }
    view () {
      t.pass()
      return <p>{ this.state.name }</p>
    }
  }

  class Parent extends Presenter {
    viewModel () {
      return { name: state => state.name }
    }
    view () {
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

test('model is an alias for viewModel', t => {
  class Hello extends Presenter {
    model ({ place }) {
      return {
        greeting: "Hello, " + place + "!"
      }
    }

    view ({ greeting }) {
      return <p>{ greeting }</p>
    }
  }

  let wrapper = mount(<Hello place="world" />)

  t.is(wrapper.text(), 'Hello, world!')
})

test('calls a teardown method when it unmounts', t => {
  t.plan(1)

  class Test extends Presenter {
    teardown () {
      t.pass()
    }
  }

  mount(<Test />).unmount()
})

test('teardown gets the last props', t => {
  t.plan(1)

  class Test extends Presenter {
    teardown (repo, props) {
      t.is(props.test, 'bar')
    }
  }

  mount(<Test test="foo" />).setProps({ test: 'bar' }).unmount()
})
