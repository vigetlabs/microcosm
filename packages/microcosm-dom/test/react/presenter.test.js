/* @jsx React.createElement */

import React from 'react'
import { Microcosm, Observable, patch } from 'microcosm'
import { Presenter, ActionButton, withSend } from 'microcosm-dom/react'
import { mount } from 'enzyme'

let View = () => <ActionButton action="test" value={true} />

class Repo extends Microcosm {
  setup() {
    this.addDomain('color', {
      getInitialState() {
        return 'yellow'
      }
    })
  }
}

describe('::getModel', function() {
  it('passes data to the view ', function() {
    class Hello extends Presenter {
      getModel(repo, { place }) {
        return {
          greeting: `Hello, ${place}!`
        }
      }

      render() {
        return <p>{this.model.greeting}</p>
      }
    }

    let wrapper = mount(<Hello place="world" />)

    expect(wrapper.text()).toEqual('Hello, world!')
  })

  it('builds the view model into state', function() {
    class MyPresenter extends Presenter {
      getModel(repo) {
        return {
          color: repo.answers.color
        }
      }
      render() {
        return <div>{this.model.color}</div>
      }
    }

    let repo = new Repo()

    let presenter = mount(<MyPresenter repo={repo} />)

    repo.push(patch, { color: 'red' })

    expect(presenter.text()).toEqual('red')
  })

  it('handles non-function view model bindings', function() {
    class MyPresenter extends Presenter {
      getModel(repo, { name }) {
        return {
          upper: name.toUpperCase()
        }
      }
      render() {
        return <p>{this.model.upper}</p>
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

      render() {
        spy(this.model)
        return null
      }
    }

    let repo = new Repo()

    mount(<MyPresenter repo={repo} />)

    repo.push(patch, repo.state)
    repo.push(patch, { color: 'turqoise' })

    expect(spy).toHaveBeenCalledTimes(1)
  })

  describe('when updating props', function() {
    it('recalculates the view model if the props are different', function() {
      let repo = new Microcosm()

      repo.addDomain('name', {
        getInitialState() {
          return 'Kurtz'
        }
      })

      class Namer extends Presenter {
        getModel(repo, { prefix }) {
          return {
            // TODO: We should add Observable.map
            name: new Observable(observer => {
              return repo.answers.name.subscribe(name => {
                observer.next(prefix + ' ' + name)
              })
            })
          }
        }
        render() {
          return <p>{this.model.name}</p>
        }
      }

      let wrapper = mount(<Namer prefix="Colonel" repo={repo} />)

      wrapper.setProps({ prefix: 'Captain' })

      expect(wrapper.text()).toEqual('Captain Kurtz')
    })

    it('does not recalculate the view model if the props are the same', function() {
      let repo = new Microcosm()
      let spy = jest.fn()

      class Namer extends Presenter {
        getModel = spy

        render() {
          return <span />
        }
      }

      let wrapper = mount(<Namer prefix="Colonel" repo={repo} />)

      wrapper.setProps({ prefix: 'Colonel' })

      expect(spy.mock.calls.length).toEqual(1)
    })
  })

  describe('when updating state', function() {
    class Namer extends Presenter {
      state = {
        greeting: 'Hello'
      }

      getModel(repo, props, state) {
        return {
          text: state.greeting + ', ' + props.name
        }
      }

      render() {
        let { text } = this.model

        return <p>{text}</p>
      }
    }

    it('calculates the model with state', function() {
      let wrapper = mount(<Namer name="Colonel" />)

      expect(wrapper.text()).toEqual('Hello, Colonel')
    })

    it('recalculates the model when state changes', function() {
      class Test extends Namer {
        ready() {
          this.setState({ greeting: 'Salutations' })
        }
      }

      let wrapper = mount(<Test name="Colonel" />)

      expect(wrapper.text()).toEqual('Salutations, Colonel')
    })

    it('does not recalculate the model when state is the same', function() {
      let spy = jest.fn()

      class TrackedNamer extends Namer {
        getModel = spy

        ready() {
          this.setState({ greeting: 'Hello' })
        }

        render() {
          return <p>Test</p>
        }
      }

      mount(<TrackedNamer name="Colonel" />)

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})

describe('::setup', function() {
  it('the model is not available in setup', function() {
    expect.assertions(1)

    class MyPresenter extends Presenter {
      setup() {
        expect(this.model).toEqual({})
      }
      getModel() {
        return { foo: 'bar' }
      }
    }

    mount(<MyPresenter />)
  })

  it('runs a setup function when created', function() {
    let test = jest.fn()

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

      getModel(repo) {
        return {
          prop: repo.answers.prop
        }
      }

      render() {
        return <p>{this.model.prop}</p>
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
})

describe('::ready', function() {
  it('runs after setup setup', function() {
    expect.assertions(1)

    class MyPresenter extends Presenter {
      setup() {
        this.setupCalled = true
      }
      ready() {
        expect(this.setupCalled).toBe(true)
      }
    }

    mount(<MyPresenter />)
  })

  it('has the latest model', function() {
    expect.assertions(1)

    class MyPresenter extends Presenter {
      setup(repo) {
        repo.addDomain('test', {
          getInitialState: () => 'test'
        })
      }

      ready() {
        expect(this.model.test).toEqual('test')
      }

      getModel(repo) {
        return {
          test: repo.answers.test
        }
      }
    }

    mount(<MyPresenter />)
  })
})

describe('::update', function() {
  it('runs an update function when it gets new props', function() {
    let test = jest.fn()

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
    let callback = jest.fn()

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
    let test = jest.fn()

    class MyPresenter extends Presenter {
      getModel(repo, props) {
        return {
          next: props.test
        }
      }
      update(repo, props) {
        test(this.model.next)
      }
    }

    let wrapper = mount(<MyPresenter test="one" />)

    wrapper.setProps({ test: 'two' })

    expect(test).toHaveBeenCalledTimes(1)
    expect(test).toHaveBeenCalledWith('two')
  })
})

describe('::teardown', function() {
  it('teardown gets the last props', function() {
    let spy = jest.fn()

    class Test extends Presenter {
      get teardown() {
        return spy
      }
    }

    let wrapper = mount(<Test test="foo" />)

    wrapper.setProps({ test: 'bar' })

    wrapper.unmount()

    expect(spy.mock.calls[0][1].test).toEqual('bar')
  })

  it('eliminates the teardown subscription when overriding getRepo', function() {
    let spy = jest.fn()

    class Test extends Presenter {
      teardown = spy

      getRepo(repo) {
        return repo
      }
    }

    let repo = new Microcosm()
    let wrapper = mount(<Test repo={repo} />)

    wrapper.unmount()
    repo.complete()

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('does not teardown a repo that is not a fork', function() {
    let spy = jest.fn()

    class Test extends Presenter {
      getRepo(repo) {
        return repo
      }
    }

    let repo = new Microcosm()

    repo.subscribe({ complete: spy })

    mount(<Test repo={repo} />).unmount()

    expect(spy).toHaveBeenCalledTimes(0)
  })

  it('unsubscribes from an unforked repo', function() {
    let repo = new Microcosm()
    let renders = 0

    class Test extends Presenter {
      getModel() {
        return {
          test: repo.answers.test
        }
      }
      getRepo(repo) {
        return repo
      }
      render() {
        renders += 1
        return <p>Test</p>
      }
    }

    mount(<Test repo={repo} />).unmount()

    repo.addDomain('test', {
      getInitialState: () => true
    })

    // Once: for the initial calculation
    expect(renders).toBe(1)
  })

  it('changes during teardown do not cause a recalculation', function() {
    let renders = 0

    class Test extends Presenter {
      setup(repo) {
        repo.addDomain('test', {
          getInitialState: () => true
        })
      }

      getModel(repo) {
        return {
          test: repo.answers.test
        }
      }

      teardown(repo) {
        repo.push(patch, { test: false })
      }

      render() {
        renders += 1
        return <p>Test</p>
      }
    }

    let repo = new Microcosm()

    mount(<Test repo={repo} />).unmount()

    // Once: for the initial calculation
    expect(renders).toBe(1)
  })
})

describe('purity', function() {
  it('does not cause a re-render when shallowly equal', function() {
    let repo = new Microcosm()
    let renders = jest.fn(() => <p>Test</p>)

    repo.push(patch, { name: 'Kurtz' })

    class Namer extends Presenter {
      getModel(repo) {
        return { name: repo.answers.name }
      }

      render() {
        return renders()
      }
    }

    mount(<Namer repo={repo} />)

    repo.push(patch, { name: 'Kurtz', unrelated: true })

    expect(renders).toHaveBeenCalledTimes(1)
  })
})

describe('unmounting', function() {
  it('ignores an repo when it unmounts', function() {
    let complete = jest.fn()

    class Test extends Presenter {
      setup(repo) {
        repo.subscribe({ complete })
      }
    }

    mount(<Test />).unmount()

    expect(complete).toHaveBeenCalled()
  })

  it('does not update the view model when umounted', function() {
    let spy = jest.fn(n => {})

    class MyPresenter extends Presenter {
      // This should only run once
      get getModel() {
        return spy
      }
    }

    let repo = new Microcosm()
    let wrapper = mount(<MyPresenter repo={repo} />)

    wrapper.unmount()

    repo.push(patch, { foo: 'bar' })

    expect(spy.mock.calls.length).toEqual(1)
  })
})

describe('Efficiency', function() {
  it('child view model is not recalculated when parent repos cause them to re-render', function() {
    let repo = new Repo()

    let model = jest.fn(repo => {
      return {
        color: repo.answers.color
      }
    })

    class Child extends Presenter {
      getModel = model

      render() {
        return <p>{this.model.color}</p>
      }
    }

    class Parent extends Presenter {
      render() {
        return <Child />
      }
    }

    let wrapper = mount(<Parent repo={repo} />)

    repo.push(patch, { color: 'green' })

    expect(model).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toEqual('green')
  })

  it('should re-render when state changes', function() {
    let spy = jest.fn()

    class Test extends Presenter {
      ready() {
        this.setState({ test: true })
      }

      render() {
        spy()
        return null
      }
    }

    mount(<Test />)

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('should re-render when a property is added', function() {
    let renders = 0

    class Test extends Presenter {
      render() {
        renders += 1
        return null
      }
    }

    mount(<Test />).setProps({ another: true })

    expect(renders).toBe(2)
  })

  it('should re-render when a property is removed', function() {
    let renders = 0

    class Test extends Presenter {
      render() {
        renders += 1
        return null
      }
    }

    mount(<Test prop="true" />).setProps({ prop: null })

    expect(renders).toBe(2)
  })

  it('cancels pending updates when unmounted', function() {
    let renders = 0

    class Test extends Presenter {
      getModel() {
        return {
          anything: Math.random()
        }
      }

      render() {
        renders += 1
        return <p>Test</p>
      }
    }

    let repo = new Repo()
    let wrapper = mount(<Test repo={repo} />)

    // Cause a change
    repo.push(patch, { color: 'teal' })

    // Unmounting should kill all outstanding update frames
    wrapper.unmount()

    // The frame should have been cancelled, so render is called once
    expect(renders).toBe(1)
  })

  it('does not render again if forced to render in the meantime', function() {
    let renders = 0

    class Test extends Presenter {
      getModel() {
        return {
          anything: Math.random()
        }
      }
      render() {
        renders += 1
        return null
      }
    }

    let repo = new Repo()
    let wrapper = mount(<Test repo={repo} />)

    // Cause a change
    repo.push(patch, { color: 'teal' })

    // Now send new properties in, which forces a render
    wrapper.setProps({ foo: 'bar' })

    // The frame should have been cancelled, so render is called twice:
    // for the initial render, and new props
    expect(renders).toBe(2)
  })

  it('batches pending updates', function() {
    let renders = 0

    class Test extends Presenter {
      getModel() {
        return {
          anything: Math.random()
        }
      }
      render() {
        renders += 1
        return null
      }
    }

    let repo = new Repo()
    let wrapper = mount(<Test repo={repo} />)

    // Cause a change
    repo.push(patch, { color: 'teal' })

    // Now send new properties in, which forces a render
    wrapper.setProps({ foo: 'bar' })
    wrapper.setProps({ foo: 'baz' })

    // The frame should have been cancelled, so render is called three times:
    // for the initial render, and the two property injections
    expect(renders).toBe(3)
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
    let test = jest.fn()

    class Test extends Presenter {
      intercept() {
        return { test }
      }
      render() {
        return <View />
      }
    }

    mount(<Test />).simulate('click')

    expect(test).toHaveBeenCalled()
  })

  it('actions do not bubble to different repo types', function() {
    let top = new Microcosm({ debug: true })
    let bottom = new Microcosm({ debug: true })

    mount(
      <Presenter repo={top}>
        <Presenter repo={bottom}>
          <View />
        </Presenter>
      </Presenter>
    ).simulate('click')

    expect(top.history.size).toBe(0)
    expect(bottom.history.size).toBe(1)
  })

  it('intents do not bubble to different repo types even if not forking', function() {
    class Child extends Presenter {
      render() {
        return <View />
      }
    }

    class Parent extends Presenter {
      getRepo(repo) {
        return repo
      }
      render() {
        return <div>{this.props.children}</div>
      }
    }

    let top = new Microcosm({ debug: true })
    let bottom = new Microcosm({ debug: true })

    let wrapper = mount(
      <Parent repo={top}>
        <Child repo={bottom} />
      </Parent>
    )

    wrapper.find(View).simulate('click')

    expect(top.history.size).toBe(0)
    expect(bottom.history.size).toBe(1)
  })

  it('forwards intents to the repo as actions', function() {
    class MyPresenter extends Presenter {
      render() {
        return <View />
      }
    }

    let repo = new Microcosm({ debug: true })

    mount(<MyPresenter repo={repo} />).simulate('click')

    expect(Array.from(repo.history).toString()).toEqual('test')
  })

  it('send bubbles up to parent presenters', function() {
    let test = jest.fn()
    let intercepted = jest.fn()

    class Child extends Presenter {
      render() {
        return <View />
      }
    }

    class Parent extends Presenter {
      intercept() {
        return { test: (repo, props) => intercepted(props) }
      }
      render() {
        return <Child />
      }
    }

    mount(<Parent />).simulate('click')

    expect(test).not.toHaveBeenCalled()
    expect(intercepted).toHaveBeenCalledWith(true)
  })

  it('send with an action bubbles up to parent presenters', function() {
    let test = jest.fn()
    let intercepted = jest.fn()

    let Child = withSend(function({ send }) {
      return <button id="button" onClick={() => send(test, true)} />
    })

    class Parent extends Presenter {
      intercept() {
        return {
          [test]: (repo, val) => intercepted(val)
        }
      }
      render() {
        return <Child />
      }
    }

    mount(<Parent repo={new Microcosm()} />).simulate('click')

    expect(test).not.toHaveBeenCalled()
    expect(intercepted).toHaveBeenCalledWith(true)
  })

  it('actions are tagged', function() {
    let spy = jest.fn()

    let a = function a() {}
    let b = function a() {}

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
      render() {
        return <TestView />
      }
    }

    mount(<Test />).simulate('click')

    expect(spy).not.toHaveBeenCalled()
  })

  it('send is available in setup', function() {
    let test = jest.fn()

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
    let test = jest.fn()

    class Parent extends Presenter {
      intercept() {
        return { test }
      }
    }

    mount(<Parent />)
      .instance()
      .send('test', true)

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

    mount(<Parent />)
      .instance()
      .send('test')
  })

  it('context is the intercepting presenter', function() {
    expect.assertions(1)

    class Parent extends Presenter {
      intercept() {
        return {
          test: this.assertionFunction
        }
      }

      assertionFunction() {
        expect(this).toBeInstanceOf(Parent)
      }
    }

    class Child extends Presenter {
      render() {
        return <ActionButton action="test" />
      }
    }

    mount(
      <Parent>
        <Child />
      </Parent>
    ).simulate('click')
  })
})

describe('forks', function() {
  it('nested presenters fork in the correct order', function() {
    expect.assertions(9)

    class Top extends Presenter {
      setup(repo) {
        repo.addDomain('top', {
          getInitialState() {
            return 'top'
          }
        })

        expect(repo.answers).not.toHaveProperty('middle')
        expect(repo.answers).not.toHaveProperty('bottom')
      }
    }

    class Middle extends Presenter {
      setup(repo) {
        repo.addDomain('middle', {
          getInitialState() {
            return 'middle'
          }
        })

        // State should exist, but the fork should not manage these keys:
        expect(repo.state.top).toBe('top')
        expect(repo.answers).not.toHaveProperty('bottom')
        expect(repo.answers).not.toHaveProperty('top')
      }
    }

    class Bottom extends Presenter {
      setup(repo) {
        repo.addDomain('bottom', {
          getInitialState() {
            return 'bottom'
          }
        })

        // State should exist, but the fork should not manage these keys:
        expect(repo.state.top).toBe('top')
        expect(repo.answers).not.toHaveProperty('top')
        expect(repo.state.middle).toBe('middle')
        expect(repo.answers).not.toHaveProperty('middle')
      }
    }

    mount(
      <Top>
        <Middle>
          <Bottom />
        </Middle>
      </Top>
    )
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

      render() {
        let send = this.send

        return <button onClick={() => send('test')}>Click me</button>
      }
    }

    mount(<Test />).simulate('click')
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

    wrapper.find(ActionButton).simulate('click')
  })
})

describe('::children', function() {
  it('re-renders when it gets new children', function() {
    let wrapper = mount(<Presenter children="1" />)

    wrapper.setProps({ children: '2' })

    expect(wrapper.text()).toEqual('2')
  })

  it('does not recalculate the model when receiving new children', function() {
    let spy = jest.fn()

    class Test extends Presenter {
      getModel = spy
    }

    let children = <span>1</span>
    let wrapper = mount(<Test children={children} />)

    wrapper.setProps({ children })

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
