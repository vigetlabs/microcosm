import React from 'react'
import Microcosm from '../../src/microcosm'
import Presenter from '../../src/addons/presenter'
import ActionButton from '../../src/addons/action-button'
import withSend from '../../src/addons/with-send'
import { mount } from 'enzyme'

const View = withSend(function({ send }) {
  return <button id="button" onClick={() => send('test', true)} />
})

class Repo extends Microcosm {
  getInitialState() {
    return { color: 'yellow' }
  }
}

describe('refs', function() {
  it('should support string refs', function() {
    class MyPresenter extends Presenter {
      render() {
        return <p ref="container">Test</p>
      }
    }

    let wrapper = mount(<MyPresenter />)

    expect(wrapper.ref('container').length).toEqual(1)
  })

  it('updates the ref when the component unmounts', function() {
    var count = 0

    class MyPresenter extends Presenter {
      render() {
        return <p ref={() => (this.foo = count++)}>Test</p>
      }
    }

    let wrapper = mount(<MyPresenter />)

    expect(wrapper.get(0).foo).toEqual(0)

    wrapper.unmount()

    expect(wrapper.get(0).foo).toEqual(1)
  })
})

describe('::getModel', function() {
  it('passes data to the view ', function() {
    class Hello extends Presenter {
      getModel({ place }) {
        return {
          greeting: 'Hello, ' + place + '!'
        }
      }

      view({ greeting }) {
        return (
          <p>
            {greeting}
          </p>
        )
      }
    }

    let wrapper = mount(<Hello place="world" />)

    expect(wrapper.text()).toEqual('Hello, world!')
  })

  it('passes send within the model', function() {
    let spy = jest.fn()

    class Hello extends Presenter {
      intercept() {
        return {
          test: spy
        }
      }
      view({ send }) {
        return <button onClick={() => send('test')} />
      }
    }

    mount(<Hello place="world" />).simulate('click')

    expect(spy).toHaveBeenCalled()
  })

  it('references the forked repo', function() {
    expect.assertions(1)

    let repo = new Microcosm()

    class Test extends Presenter {
      view(model) {
        expect(model.repo.parent).toBe(repo)

        return <p>Test</p>
      }
    }

    mount(<Test repo={repo} />)
  })

  it('builds the view model into state', function() {
    class MyPresenter extends Presenter {
      getModel() {
        return {
          color: state => state.color
        }
      }
      view({ color }) {
        return (
          <div>
            {color}
          </div>
        )
      }
    }

    const repo = new Repo()
    const presenter = mount(<MyPresenter repo={repo} />)

    repo.patch({ color: 'red' })

    const text = presenter.text()

    expect(text).toEqual('red')
  })

  it('handles non-function view model bindings', function() {
    class MyPresenter extends Presenter {
      getModel({ name }) {
        return {
          upper: name.toUpperCase()
        }
      }
      view({ upper }) {
        return (
          <p>
            {upper}
          </p>
        )
      }
    }

    var presenter = mount(<MyPresenter name="phil" />)

    expect(presenter.text()).toEqual('PHIL')
  })

  it('does not update state if no key changes', function() {
    let spy = jest.fn(() => <p>Test</p>)

    class MyPresenter extends Presenter {
      getModel() {
        return { active: true }
      }

      view = spy
    }

    const repo = new Repo()

    mount(<MyPresenter repo={repo} />)

    repo.patch({ color: 'green' })
    repo.patch({ color: 'turquoise' })

    expect(spy).toHaveBeenCalledTimes(1)
  })

  describe('when first building a model', function() {
    it('passes the repo as the second argument of model callbacks', function() {
      expect.assertions(1)

      let repo = new Repo()

      class TestCase extends Presenter {
        getModel(props) {
          return {
            name: this.process
          }
        }

        process(_state, fork) {
          expect(fork.parent).toBe(repo)
        }
      }

      mount(<TestCase repo={repo} />)
    })

    it('invokes model callbacks in the scope of the presenter', function() {
      expect.assertions(1)

      class TestCase extends Presenter {
        getModel(props) {
          return {
            name: this.process
          }
        }

        process() {
          expect(this).toBeInstanceOf(TestCase)
        }
      }

      mount(<TestCase />)
    })
  })

  describe('when updating props', function() {
    it('recalculates the view model if the props are different', function() {
      const repo = new Microcosm()

      repo.addDomain('name', {
        getInitialState() {
          return 'Kurtz'
        }
      })

      class Namer extends Presenter {
        getModel(props) {
          return {
            name: state => props.prefix + ' ' + state.name
          }
        }
        view({ name }) {
          return (
            <p>
              {name}
            </p>
          )
        }
      }

      const wrapper = mount(<Namer prefix="Colonel" repo={repo} />)

      wrapper.setProps({ prefix: 'Captain' })

      expect(wrapper.text()).toEqual('Captain Kurtz')
    })

    it('does not recalculate the view model if the props are the same', function() {
      const repo = new Microcosm()
      const spy = jest.fn()

      class Namer extends Presenter {
        getModel = spy
      }

      const wrapper = mount(<Namer prefix="Colonel" repo={repo} />)

      wrapper.setProps({ prefix: 'Colonel' })

      expect(spy.mock.calls.length).toEqual(1)
    })

    it('passes the repo as the second argument of model callbacks', function() {
      expect.assertions(2)

      let repo = new Repo()

      class TestCase extends Presenter {
        getModel(props) {
          return {
            name: this.process
          }
        }

        process(_state, fork) {
          expect(fork.parent).toBe(repo)
        }
      }

      mount(<TestCase repo={repo} />)

      repo.patch({ color: 'purple' })
    })

    it('invokes model callbacks in the scope of the presenter', function() {
      expect.assertions(2)

      let repo = new Repo()

      class TestCase extends Presenter {
        getModel(props) {
          return {
            name: this.process
          }
        }

        process() {
          expect(this).toBeInstanceOf(TestCase)
        }
      }

      mount(<TestCase repo={repo} />)

      repo.patch({ color: 'purple' })
    })
  })

  describe('when updating state', function() {
    class Namer extends Presenter {
      state = {
        greeting: 'Hello'
      }

      getModel(props, state) {
        return {
          text: state.greeting + ', ' + props.name
        }
      }

      render() {
        const { text } = this.model

        return (
          <p>
            {text}
          </p>
        )
      }
    }

    it('calculates the model with state', function() {
      const wrapper = mount(<Namer name="Colonel" />)

      expect(wrapper.text()).toEqual('Hello, Colonel')
    })

    it('recalculates the model when state changes', function() {
      const wrapper = mount(<Namer name="Colonel" />)

      wrapper.setState({
        greeting: 'Salutations'
      })

      expect(wrapper.text()).toEqual('Salutations, Colonel')
    })

    it('does not recalculate the model when state is the same', function() {
      const spy = jest.fn(function() {
        return <p>Test</p>
      })

      class TrackedNamer extends Namer {
        view = spy
      }

      const wrapper = mount(<TrackedNamer name="Colonel" />)

      wrapper.setState({
        greeting: 'Hello'
      })

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('invoking model callbacks', function() {
    it('supports any callable value', function() {
      let callable = {
        call: jest.fn()
      }

      class MyPresenter extends Presenter {
        getModel() {
          return {
            test: callable
          }
        }
      }

      mount(<MyPresenter />)

      expect(callable.call).toHaveBeenCalled()
    })
  })
})

describe('::setup', function() {
  it('runs a setup function when created', function() {
    const test = jest.fn()

    class MyPresenter extends Presenter {
      get setup() {
        return test
      }
    }

    mount(<MyPresenter repo={new Microcosm()} />)

    expect(test).toHaveBeenCalled()
  })

  it('domains added in setup show up in the view model', function() {
    class MyPresenter extends Presenter {
      setup(repo) {
        repo.addDomain('prop', {
          getInitialState() {
            return 'test'
          }
        })
      }

      getModel() {
        return {
          prop: state => state.prop
        }
      }

      view({ prop }) {
        return (
          <p>
            {prop}
          </p>
        )
      }
    }

    let prop = mount(<MyPresenter />).text()

    expect(prop).toEqual('test')
  })

  it('calling setState in setup does not raise a warning', function() {
    class MyPresenter extends Presenter {
      setup() {
        this.setState({ foo: 'bar' })
      }
    }

    mount(<MyPresenter repo={new Microcosm()} />)
  })

  it('setup is called before the initial model', function() {
    expect.assertions(1)

    class Test extends Presenter {
      setup() {
        expect(this.model).not.toBeDefined()
      }
      getModel() {
        return {
          test: true
        }
      }
    }

    mount(<Test />)
  })
})

describe('::ready', function() {
  it('runs after setup setup', function() {
    expect.assertions(1)

    class MyPresenter extends Presenter {
      setup = jest.fn()

      ready() {
        expect(this.setup).toHaveBeenCalled()
      }
    }

    mount(<MyPresenter />)
  })

  it('has the latest model', function() {
    expect.assertions(1)

    class MyPresenter extends Presenter {
      setup(repo) {
        repo.addDomain('prop', {
          getInitialState() {
            return 'test'
          }
        })
      }

      ready() {
        expect(this.model.prop).toEqual('test')
      }

      getModel() {
        return {
          prop: state => state.prop
        }
      }
    }

    mount(<MyPresenter />)
  })
})

describe('::update', function() {
  it('runs an update function when it gets new props', function() {
    const test = jest.fn()

    class MyPresenter extends Presenter {
      update(repo, props) {
        test(props.test)
      }
    }

    let wrapper = mount(<MyPresenter test="foo" />)

    wrapper.setProps({ test: 'bar' })

    expect(test).toHaveBeenCalledTimes(1)
    expect(test).toHaveBeenCalledWith('bar')
  })

  it('does not run an update function when no props change', function() {
    let wrapper = mount(<Presenter test="foo" />)
    let spy = jest.spyOn(wrapper.instance(), 'update')

    wrapper.setProps({ test: 'foo' })

    expect(spy).not.toHaveBeenCalled()
  })

  it('it has access to the old props when update is called', function() {
    const callback = jest.fn()

    class Test extends Presenter {
      update(repo, { color }) {
        callback(this.props.color, color)
      }
    }

    mount(
      <Test color="red">
        <p>Hey</p>
      </Test>
    ).setProps({ color: 'blue' })

    expect(callback).toHaveBeenCalledWith('red', 'blue')
  })

  it('has the latest model when props change', function() {
    const test = jest.fn()

    class MyPresenter extends Presenter {
      getModel(props) {
        return {
          next: props.test
        }
      }
      update(repo, props) {
        test(this.model.next)
      }
    }

    let wrapper = mount(<MyPresenter test="foo" />)

    wrapper.setProps({ test: 'bar' })

    expect(test).toHaveBeenCalledTimes(1)
    expect(test).toHaveBeenCalledWith('bar')
  })
})

describe('::teardown', function() {
  it('teardown gets the last props', function() {
    const spy = jest.fn()

    class Test extends Presenter {
      get teardown() {
        return spy
      }
    }

    const wrapper = mount(<Test test="foo" />)

    wrapper.setProps({ test: 'bar' })

    wrapper.unmount()

    expect(spy.mock.calls[0][1].test).toEqual('bar')
  })

  it('eliminates the teardown subscription when overriding getRepo', function() {
    const spy = jest.fn()

    class Test extends Presenter {
      teardown = spy

      getRepo(repo) {
        return repo
      }
    }

    const repo = new Microcosm()
    const wrapper = mount(<Test repo={repo} />)

    wrapper.unmount()
    repo.shutdown()

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('does not teardown a repo that is not a fork', function() {
    const spy = jest.fn()

    class Test extends Presenter {
      getRepo(repo) {
        return repo
      }
    }

    const repo = new Microcosm()

    repo.on('teardown', spy)

    mount(<Test repo={repo} />).unmount()

    expect(spy).toHaveBeenCalledTimes(0)
  })

  it('unsubscribes from an unforked repo', function() {
    const spy = jest.fn()

    class Test extends Presenter {
      getModel() {
        return { test: spy }
      }
      getRepo(repo) {
        return repo
      }
    }

    const repo = new Microcosm()

    mount(<Test repo={repo} />).unmount()

    repo.addDomain('test', {
      getInitialState: () => true
    })

    // Once: for the initial calculation
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('changes during teardown do not cause a recalculation', function() {
    const spy = jest.fn()

    class Test extends Presenter {
      getModel() {
        return { test: spy }
      }
      teardown(repo) {
        repo.addDomain('test', {
          getInitialState: () => true
        })
      }
      getRepo(repo) {
        return repo
      }
    }

    const repo = new Microcosm()

    mount(<Test repo={repo} />).unmount()

    // Once: for the initial calculation
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('::view', function() {
  it('views can be stateful react components', function() {
    class MyView extends React.Component {
      render() {
        return (
          <p>
            {this.props.message}
          </p>
        )
      }
    }

    class MyPresenter extends Presenter {
      view = MyView

      getModel() {
        return { message: 'hello' }
      }
    }

    let text = mount(<MyPresenter />).text()

    expect(text).toEqual('hello')
  })

  it('views can be stateless components', function() {
    function MyView({ message }) {
      return (
        <p>
          {message}
        </p>
      )
    }

    class MyPresenter extends Presenter {
      view = MyView

      getModel() {
        return { message: 'hello' }
      }
    }

    let text = mount(<MyPresenter />).text()

    expect(text).toEqual('hello')
  })

  it('views can be getters', function() {
    class MyView extends React.Component {
      render() {
        return (
          <p>
            {this.props.message}
          </p>
        )
      }
    }

    class MyPresenter extends Presenter {
      get view() {
        return MyView
      }
      getModel() {
        return { message: 'hello' }
      }
    }

    let text = mount(<MyPresenter />).text()

    expect(text).toEqual('hello')
  })

  it('view getters have access to the model', function() {
    expect.assertions(1)

    class MyPresenter extends Presenter {
      get view() {
        expect(this.model.message).toEqual('hello')
        return View
      }
      getModel() {
        return { message: 'hello' }
      }
    }

    mount(<MyPresenter />)
  })
})

describe('purity', function() {
  it('does not cause a re-render when shallowly equal', function() {
    const repo = new Microcosm()
    const renders = jest.fn(() => <p>Test</p>)

    repo.patch({ name: 'Kurtz' })

    class Namer extends Presenter {
      getModel() {
        return { name: state => state.name }
      }

      get view() {
        return renders
      }
    }

    mount(<Namer repo={repo} />)

    repo.patch({ name: 'Kurtz', unrelated: true })

    expect(renders.mock.calls.length).toEqual(1)
  })
})

describe('unmounting', function() {
  it('ignores an repo when it unmounts', function() {
    const spy = jest.fn()

    class Test extends Presenter {
      setup(repo) {
        repo.teardown = spy
      }
    }

    mount(<Test />).unmount()

    expect(spy).toHaveBeenCalled()
  })

  it('does not update the view model when umounted', function() {
    const spy = jest.fn(n => {})

    class MyPresenter extends Presenter {
      // This should only run once
      get getModel() {
        return spy
      }
    }

    let repo = new Microcosm()
    let wrapper = mount(<MyPresenter repo={repo} />)

    wrapper.unmount()

    repo.patch({ foo: 'bar' })

    expect(spy.mock.calls.length).toEqual(1)
  })
})

describe('Efficiency', function() {
  it('does not subscribe to a change if there is no model', function() {
    let repo = new Repo()

    jest.spyOn(repo, 'on')

    class Parent extends Presenter {}

    mount(<Parent repo={repo} />)

    expect(repo.on).not.toHaveBeenCalled()
  })

  it('does not subscribe to a change if there is no stateful model binding', function() {
    let repo = new Repo()

    jest.spyOn(repo, 'on')

    class Parent extends Presenter {
      getModel() {
        return {
          foo: 'bar'
        }
      }
    }

    mount(<Parent repo={repo} />)

    expect(repo.on).not.toHaveBeenCalled()
  })

  it('child view model is not recalculated when parent repos cause them to re-render', function() {
    const repo = new Repo()

    const model = jest.fn(function() {
      return {
        color: state => state.color
      }
    })

    class Child extends Presenter {
      getModel = model

      render() {
        return (
          <p>
            {this.model.color}
          </p>
        )
      }
    }

    class Parent extends Presenter {
      view = Child
    }

    let wrapper = mount(<Parent repo={repo} />)

    repo.patch({ color: 'green' })

    expect(model).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toEqual('green')
  })

  it('should re-render when state changes', function() {
    const spy = jest.fn(() => null)

    class Test extends Presenter {
      view = spy
    }

    mount(<Test />).setState({ test: true })

    expect(spy).toHaveBeenCalledTimes(2)
  })
})

describe('::render', function() {
  it('the default render implementation passes children', function() {
    let wrapper = mount(
      <Presenter>
        <p>Test</p>
      </Presenter>
    )

    expect(wrapper.text()).toEqual('Test')
  })

  it('handles overridden an overriden render method', function() {
    class Test extends Presenter {
      render() {
        return <p>Test</p>
      }
    }

    expect(mount(<Test />).text()).toEqual('Test')
  })

  it('scope of render should be the presenter', function() {
    expect.assertions(1)

    class Test extends Presenter {
      render() {
        expect(this).toBeInstanceOf(Test)

        return <p>Test</p>
      }
    }

    mount(<Test />)
  })

  it('overridden render passes context', function() {
    expect.assertions(1)

    function Child(props, context) {
      expect(context.repo).toBeDefined()

      return <p>Test</p>
    }

    Child.contextTypes = {
      repo: () => {}
    }

    class Test extends Presenter {
      render() {
        return <Child />
      }
    }

    mount(<Test />)
  })

  it('allows refs', function() {
    class MyPresenter extends Presenter {
      render() {
        return <p ref="foo">Heyo</p>
      }
    }

    mount(<MyPresenter />)
  })
})

describe('::getRepo', function() {
  it('can circumvent forking command', function() {
    class NoFork extends Presenter {
      getRepo(repo) {
        return repo
      }
    }

    let repo = new Microcosm()
    let wrapper = mount(<NoFork repo={repo} />)

    expect(wrapper.instance().repo).toEqual(repo)
  })
})

describe('intercepting actions', function() {
  it('receives intent events', function() {
    const test = jest.fn()

    class MyPresenter extends Presenter {
      view = View

      intercept() {
        return { test }
      }
    }

    mount(<MyPresenter />).find(View).simulate('click')

    expect(test.mock.calls[0][1]).toEqual(true)
  })

  it('actions do not bubble to different repo types', function() {
    class Child extends Presenter {
      view = View
    }

    class Parent extends Presenter {
      render() {
        return (
          <div>
            {this.props.children}
          </div>
        )
      }
    }

    let top = new Microcosm({ maxHistory: Infinity })
    let bottom = new Microcosm({ maxHistory: Infinity })

    let wrapper = mount(
      <Parent repo={top}>
        <Child repo={bottom} />
      </Parent>
    )

    wrapper.find(View).simulate('click')

    expect(top.history.size).toBe(1)
    expect(bottom.history.size).toBe(2)
  })

  it('intents do not bubble to different repo types even if not forking', function() {
    class Child extends Presenter {
      view = View
    }

    class Parent extends Presenter {
      getRepo(repo) {
        return repo
      }
      render() {
        return (
          <div>
            {this.props.children}
          </div>
        )
      }
    }

    let top = new Microcosm({ maxHistory: Infinity })
    let bottom = new Microcosm({ maxHistory: Infinity })

    let wrapper = mount(
      <Parent repo={top}>
        <Child repo={bottom} />
      </Parent>
    )

    wrapper.find(View).simulate('click')

    expect(top.history.size).toBe(1)
    expect(bottom.history.size).toBe(2)
  })

  it('forwards intents to the repo as actions', function() {
    class MyPresenter extends Presenter {
      view() {
        return <View />
      }
    }

    const repo = new Microcosm({ maxHistory: 1 })

    mount(<MyPresenter repo={repo} />).find(View).simulate('click')

    expect(repo.history.head.command.toString()).toEqual('test')
  })

  it('send bubbles up to parent presenters', function() {
    const test = jest.fn()
    const intercepted = jest.fn()

    class Child extends Presenter {
      view() {
        return <View />
      }
    }

    class Parent extends Presenter {
      intercept() {
        return { test: (repo, props) => intercepted(props) }
      }
      view() {
        return <Child />
      }
    }

    mount(<Parent repo={new Microcosm()} />).find(View).simulate('click')

    expect(test).not.toHaveBeenCalled()
    expect(intercepted).toHaveBeenCalledWith(true)
  })

  it('send with an action bubbles up to parent presenters', function() {
    const test = jest.fn()
    const intercepted = jest.fn()

    const Child = withSend(function({ send }) {
      return <button id="button" onClick={() => send(test, true)} />
    })

    class Parent extends Presenter {
      intercept() {
        return {
          [test]: (repo, val) => intercepted(val)
        }
      }
      view() {
        return <Child />
      }
    }

    mount(<Parent repo={new Microcosm()} />).find(Child).simulate('click')

    expect(test).not.toHaveBeenCalled()
    expect(intercepted).toHaveBeenCalledWith(true)
  })

  it('actions are tagged', function() {
    const spy = jest.fn()

    const a = function a() {}
    const b = function a() {}

    class TestView extends React.Component {
      static contextTypes = {
        send: () => {}
      }
      render() {
        return <button id="button" onClick={() => this.context.send(b, true)} />
      }
    }

    class Test extends Presenter {
      intercept() {
        return { [a]: spy }
      }
      view() {
        return <TestView />
      }
    }

    mount(<Test />).find(TestView).simulate('click')

    expect(spy).not.toHaveBeenCalled()
  })

  it('send is available in setup', function() {
    const test = jest.fn()

    class Parent extends Presenter {
      setup() {
        this.send('test')
      }
      intercept() {
        return { test }
      }
    }

    mount(<Parent />)

    expect(test).toHaveBeenCalled()
  })

  it('send can be called directly from the Presenter', function() {
    const test = jest.fn()

    class Parent extends Presenter {
      intercept() {
        return { test }
      }
    }

    mount(<Parent />).instance().send('test', true)

    expect(test).toHaveBeenCalled()
  })

  it('shares context between setup() and intercept()', function() {
    class Parent extends Presenter {
      setup() {
        this.foo = 'bar'
      }

      intercept() {
        return {
          test: this.assertionFunction
        }
      }

      assertionFunction() {
        expect(this.foo).toEqual('bar')
      }
    }

    mount(<Parent />).instance().send('test')
  })
})

describe('forks', function() {
  it('nested presenters fork in the correct order', function() {
    class Top extends Presenter {
      setup(repo) {
        repo.name = 'top'
      }
    }

    class Middle extends Presenter {
      setup(repo) {
        repo.name = 'middle'
      }
    }

    class Bottom extends Presenter {
      setup(repo) {
        repo.name = 'bottom'
      }

      render() {
        let names = []
        let repo = this.repo

        while (repo) {
          names.push(repo.name)
          repo = repo.parent
        }

        return (
          <p>
            {names.join(', ')}
          </p>
        )
      }
    }

    const text = mount(
      <Top>
        <Middle>
          <Bottom />
        </Middle>
      </Top>
    ).text()

    expect(text).toEqual('bottom, middle, top')
  })
})

describe('::send', function() {
  it('autobinds send', function() {
    expect.assertions(2)

    class Test extends Presenter {
      prop = true

      intercept() {
        return {
          test: () => {
            expect(this).toBeInstanceOf(Test)
            expect(this.prop).toBe(true)
          }
        }
      }

      view = function({ send }) {
        return <button onClick={() => send('test')}>Click me</button>
      }
    }

    mount(<Test />).find('button').simulate('click')
  })

  it('dispatches the action using the current repo if nothing else responds', function() {
    expect.assertions(1)

    class Parent extends Presenter {
      setup(repo) {
        repo.addDomain('parent', {
          getInitialState() {
            return true
          }
        })
      }
    }

    class Child extends Presenter {
      setup(repo) {
        repo.addDomain('child', {
          getInitialState() {
            return true
          }
        })
      }
    }

    let action = function() {
      return function(action, repo) {
        expect(repo.state.child).toBe(true)
      }
    }

    let wrapper = mount(
      <Parent>
        <Child>
          <ActionButton action={action} />
        </Child>
      </Parent>
    )

    wrapper.find('ActionButton').simulate('click')
  })
})

describe('::children', function() {
  it('re-renders when it gets new children', function() {
    let wrapper = mount(
      <Presenter>
        <span>1</span>
      </Presenter>
    )

    wrapper.setProps({ children: <span>2</span> })

    expect(wrapper.text()).toEqual('2')
  })

  it('does not re-render when children are the same', function() {
    let children = <span>1</span>
    let wrapper = mount(
      <Presenter>
        {children}
      </Presenter>
    )

    let presenter = wrapper.instance()

    jest.spyOn(presenter, 'render')

    wrapper.setProps({ children })

    expect(presenter.render).not.toHaveBeenCalled()
  })
})
