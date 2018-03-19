import React from 'react'
import { Microcosm, Observable, patch } from 'microcosm'
import { Presenter, ActionButton, withSend } from 'microcosm-dom/react'
import { delay, mount, unmount, PropsTransition } from './helpers'

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

    let el = mount(<Hello place="world" />)

    expect(el.textContent).toEqual('Hello, world!')
  })

  it('builds the view model into state', async function() {
    class MyPresenter extends Presenter {
      getModel(repo) {
        return {
          color: repo.domains.color
        }
      }
      render() {
        return <div>{this.model.color}</div>
      }
    }

    let repo = new Repo()

    let presenter = mount(<MyPresenter repo={repo} />)

    repo.push(patch, { color: 'red' })

    await delay()

    expect(presenter.textContent).toEqual('red')
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

    expect(presenter.textContent).toEqual('PHIL')
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
    it('recalculates the view model if the props are different', async function() {
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
              return repo.domains.name.subscribe(name => {
                observer.next(prefix + ' ' + name)
              })
            })
          }
        }
        render() {
          return <p>{this.model.name}</p>
        }
      }

      let before = { prefix: 'Colonel', repo }
      let after = { prefix: 'Captain', repo }

      let el = mount(
        <PropsTransition component={Namer} before={before} after={after} />
      )

      await delay()

      expect(el.textContent).toEqual('Captain Kurtz')
    })

    it('does not recalculate the view model if the props are the same', function() {
      let spy = jest.fn()

      class Namer extends Presenter {
        getModel = spy

        render() {
          return <span />
        }
      }

      mount(
        <PropsTransition
          component={Namer}
          before={{ prefix: 'Colonel' }}
          after={{ prefix: 'Colonel' }}
        />
      )

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
      let el = mount(<Namer name="Colonel" />)

      expect(el.textContent).toEqual('Hello, Colonel')
    })

    it('recalculates the model when state changes', async function() {
      class Test extends Namer {
        ready() {
          this.setState({ greeting: 'Salutations' })
        }
      }

      let el = mount(<Test name="Colonel" />)

      await delay()

      expect(el.textContent).toEqual('Salutations, Colonel')
    })

    it('does not recalculate the model when state is the same', async function() {
      let spy = jest.fn()

      class Test extends Namer {
        getModel = spy

        ready() {
          this.setState(this.state)
        }
      }

      mount(<Test name="Colonel" />)

      await delay()

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
          prop: repo.domains.prop
        }
      }

      render() {
        return <p>{this.model.prop}</p>
      }
    }

    let prop = mount(<MyPresenter />).textContent

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
          test: repo.domains.test
        }
      }
    }

    mount(<MyPresenter />)
  })

  it('supports ::ready even when componentDidMount is defined', async function() {
    let callback = jest.fn()

    class Test extends Presenter {
      ready(repo) {
        callback()
      }
      componentDidMount() {
        // noop
      }
    }

    mount(<Test />)

    expect(callback).toHaveBeenCalledWith()
  })
})

describe('::update', function() {
  it('runs an update function when it gets new props', async function() {
    expect.assertions(1)

    class Test extends Presenter {
      update(repo, props) {
        expect(props.test).toBe('bar')
      }

      render() {
        return <span>Test</span>
      }
    }

    let before = { test: 'foo' }
    let after = { test: 'bar' }

    mount(<PropsTransition component={Test} before={before} after={after} />)

    await delay()
  })

  it('does not run an update function when no props change', async function() {
    let update = jest.fn()

    class Test extends Presenter {
      update = update
    }

    let before = { test: 'foo' }
    let after = { test: 'foo' }

    mount(<PropsTransition component={Test} before={before} after={after} />)

    await delay()

    expect(update).not.toHaveBeenCalled()
  })

  it('it has access to the old props when update is called', async function() {
    let callback = jest.fn()

    class Test extends Presenter {
      update(repo, { color }) {
        callback(this.props.color, color)
      }
    }

    let before = { color: 'red' }
    let after = { color: 'blue' }

    mount(<PropsTransition component={Test} before={before} after={after} />)

    await delay()

    expect(callback).toHaveBeenCalledWith('red', 'blue')
  })

  it('has the latest model when props change', async function() {
    let test = jest.fn()

    class Test extends Presenter {
      getModel(repo, props) {
        return {
          next: props.test
        }
      }
      update(repo, props) {
        test(this.model.next)
      }
    }

    let before = { test: 'one' }
    let after = { test: 'two' }

    mount(<PropsTransition component={Test} before={before} after={after} />)

    await delay()

    expect(test).toHaveBeenCalledTimes(1)
    expect(test).toHaveBeenCalledWith('two')
  })

  it('supports ::update even when componentWillUpdate is defined', async function() {
    let callback = jest.fn()

    class Test extends Presenter {
      update(repo, { color }) {
        callback(this.props.color, color)
      }
      componentWillUpdate() {
        // noop
      }
    }

    let before = { color: 'red' }
    let after = { color: 'blue' }

    mount(<PropsTransition component={Test} before={before} after={after} />)

    await delay()

    expect(callback).toHaveBeenCalledWith('red', 'blue')
  })
})

describe('::teardown', function() {
  it('teardown gets the last props', async function() {
    expect.assertions(1)

    class Test extends Presenter {
      teardown(repo, props) {
        expect(props.test).toBe('bar')
      }
      render() {
        return <span>Test</span>
      }
    }

    let before = { test: 'foo' }
    let after = { test: 'bar' }

    let el = mount(
      <PropsTransition component={Test} before={before} after={after} />
    )

    await delay()

    unmount(el)
  })

  it('eliminates the teardown subscription when overriding getRepo', function() {
    let spy = jest.fn()

    class Test extends Presenter {
      teardown = spy

      getRepo(repo) {
        return repo
      }

      render() {
        return <p>Test</p>
      }
    }

    let repo = new Microcosm()

    unmount(mount(<Test repo={repo} />))

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

    unmount(mount(<Test repo={repo} />))

    expect(spy).toHaveBeenCalledTimes(0)
  })

  it('unsubscribes from an unforked repo', function() {
    let repo = new Microcosm()
    let renders = 0

    class Test extends Presenter {
      getModel() {
        return {
          test: repo.domains.test
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

    unmount(mount(<Test repo={repo} />))

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
          test: repo.domains.test
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

    unmount(mount(<Test repo={repo} />))

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
        return { name: repo.domains.name }
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
  it('ignores a repo when it unmounts', function() {
    let complete = jest.fn()

    class Test extends Presenter {
      setup(repo) {
        repo.subscribe({ complete })
      }
      render() {
        return <p>Test</p>
      }
    }

    unmount(mount(<Test />))

    expect(complete).toHaveBeenCalled()
  })

  it('does not update the view model when unmounted', function() {
    let spy = jest.fn(n => {})

    class MyPresenter extends Presenter {
      // This should only run once
      get getModel() {
        return spy
      }
    }

    let repo = new Microcosm()
    let el = mount(<MyPresenter repo={repo} />)

    unmount(el)

    repo.push(patch, { foo: 'bar' })

    expect(spy.mock.calls.length).toEqual(1)
  })
})

describe('Efficiency', function() {
  it('child view model is not recalculated when parent repos cause them to re-render', async function() {
    let repo = new Repo()

    let model = jest.fn(repo => {
      return {
        color: repo.domains.color
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

    let el = mount(<Parent repo={repo} />)

    repo.push(patch, { color: 'green' })

    await delay()

    expect(model).toHaveBeenCalledTimes(1)
    expect(el.textContent).toEqual('green')
  })

  it('should re-render when a property is added', async function() {
    class Test extends Presenter {
      render() {
        return <span>{this.props.text}</span>
      }
    }

    let before = { children: '1' }
    let after = { children: '1', text: 'test' }

    let el = mount(
      <PropsTransition component={Test} before={before} after={after} />
    )

    await delay()

    expect(el.textContent).toBe('test')
  })

  it('should re-render when a property is removed', async function() {
    class Test extends Presenter {
      render() {
        return <span>{this.props.text || ''}</span>
      }
    }

    let before = { text: true }
    let after = { text: null }

    let el = mount(
      <PropsTransition component={Test} before={before} after={after} />
    )

    await delay()

    expect(el.textContent).toBe('')
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
    let el = mount(<Test repo={repo} />)

    // Cause a change
    repo.push(patch, { color: 'teal' })

    // Unmounting should kill all outstanding update frames
    unmount(el)

    // The frame should have been cancelled, so render is called once
    expect(renders).toBe(1)
  })
})

describe('::render', function() {
  it('the default render implementation passes children', function() {
    let el = mount(
      <Presenter>
        <p>Test</p>
      </Presenter>
    )

    expect(el.textContent).toEqual('Test')
  })

  it('handles overridden an overriden render method', function() {
    class Test extends Presenter {
      render() {
        return <p>Test</p>
      }
    }

    expect(mount(<Test />).textContent).toEqual('Test')
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
    let picked = null

    class NoFork extends Presenter {
      getRepo(repo) {
        return repo
      }

      ready(repo) {
        picked = repo
      }
    }

    let repo = new Microcosm()

    mount(<NoFork repo={repo} />)

    expect(picked).toEqual(repo)
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

    mount(<Test />).click()

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
    ).click()

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
    }

    let top = new Microcosm({ debug: true })
    let bottom = new Microcosm({ debug: true })

    let el = mount(
      <Parent repo={top}>
        <Child repo={bottom} />
      </Parent>
    )

    el.click()

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

    mount(<MyPresenter repo={repo} />).click()

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

    mount(<Parent />).click()

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

    mount(<Parent repo={new Microcosm()} />).click()

    expect(test).not.toHaveBeenCalled()
    expect(intercepted).toHaveBeenCalledWith(true)
  })

  it('actions are tagged', function() {
    let spy = jest.fn()

    let a = function a() {}
    let b = function a() {}

    const TestView = (props, context) => (
      <button id="button" onClick={() => context.send(b, true)} />
    )

    TestView.contextTypes = {
      send: () => {}
    }

    class Test extends Presenter {
      intercept() {
        return { [a]: spy }
      }
      render() {
        return <TestView />
      }
    }

    mount(<Test />).click()

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

    class Interceptor extends Presenter {
      intercept() {
        return { test }
      }
    }

    mount(
      <Interceptor>
        <ActionButton action="test" />
      </Interceptor>
    ).click()

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

    mount(
      <Parent>
        <ActionButton action="test" />
      </Parent>
    ).click()
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
    ).click()
  })

  it('can handle multiple intercepts', function() {
    let one = jest.fn()
    let two = jest.fn()

    class Test extends Presenter {
      intercept() {
        return {
          test: [one, two]
        }
      }
      render() {
        return <ActionButton action="test" />
      }
    }

    mount(<Test />).click()

    expect(one).toHaveBeenCalled()
    expect(two).toHaveBeenCalled()
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

        expect(repo.domains).not.toHaveProperty('middle')
        expect(repo.domains).not.toHaveProperty('bottom')
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
        expect(repo.domains).not.toHaveProperty('bottom')
        expect(repo.domains).not.toHaveProperty('top')
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
        expect(repo.domains).not.toHaveProperty('top')
        expect(repo.state.middle).toBe('middle')
        expect(repo.domains).not.toHaveProperty('middle')
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

    mount(<Test />).click()
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

    mount(
      <Parent>
        <Child>
          <ActionButton action={action} />
        </Child>
      </Parent>
    ).click()
  })
})

describe('::children', function() {
  it('re-renders when it gets new children', async function() {
    let before = { children: <span>1</span> }
    let after = { children: <span>2</span> }

    let el = mount(
      <PropsTransition component={Presenter} before={before} after={after} />
    )

    await delay()

    expect(el.textContent).toEqual('2')
  })

  it('does not recalculate the model when receives the same children', function() {
    let spy = jest.fn()

    class Test extends Presenter {
      getModel = spy
    }

    let before = { children: 1 }
    let after = { children: 1 }

    mount(<PropsTransition component={Test} before={before} after={after} />)

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
