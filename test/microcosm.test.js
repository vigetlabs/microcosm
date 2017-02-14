import Microcosm from '../src/microcosm'

it('it can instantiate with a starting state', function () {
  class Repo extends Microcosm {
    setup () {
      this.addDomain('foo', {})
    }
  }

  const repo = new Repo({}, { foo: 'bar' })

  expect(repo.state.foo).toEqual('bar')
})

it('it can deserialize starting state', function () {
  class Repo extends Microcosm {
    setup () {
      this.addDomain('foo', {})
    }
  }

  let raw = JSON.stringify({ foo: 'bar' })

  let repo = new Repo({}, raw, true)

  expect(repo.state.foo).toEqual('bar')
})

it('reset returns to initial state', function () {
  const repo = new Microcosm()

  repo.addDomain('test', {
    getInitialState: () => false
  })

  repo.patch({ test: true })

  expect(repo.state.test).toBe(true)

  repo.reset()

  expect(repo.state.test).toBe(false)
})

it('can manipulate how many transactions are merged', function () {
  const repo = new Microcosm({ maxHistory: 5 })
  const identity = n => n

  repo.push(identity, 1)
  repo.push(identity, 2)
  repo.push(identity, 3)
  repo.push(identity, 4)
  repo.push(identity, 5)

  expect(repo.history.size).toEqual(5)
  repo.push(identity, 6)

  expect(repo.history.size).toEqual(5)
  expect(repo.history.root.payload).toEqual(2)
  expect(repo.history.head.payload).toEqual(6)
})

it('can partially apply push', function () {
  const repo = new Microcosm()
  const action = jest.fn()

  repo.prepare(action, 1, 2)(3)

  expect(action).toBeCalledWith(1,2,3)
})

it('can checkout a prior state', function () {
  const repo = new Microcosm({ maxHistory: Infinity })
  const action = n => n

  repo.addDomain('number', {
    register() {
      return {
        [action]: (a, b) => b
      }
    }
  })

  let start = repo.push(action, 1)

  repo.push(action, 2)
  repo.push(action, 3)

  repo.checkout(start)

  expect(repo.state.number).toEqual(1)
})

it('it will not emit a change if state is shallowly equal', function () {
  const repo = new Microcosm()
  const identity = n => n
  const spy = jest.fn()

  repo.addDomain('test', {
    getInitialState() {
      return 0
    },
    register() {
      return { [identity] : (state, next) => next }
    }
  })

  repo.on('change', spy)

  repo.push(identity, 0)

  expect(spy).not.toHaveBeenCalled()
})

it('it will emit a change if state is not shallowly equal', function () {
  const repo = new Microcosm()
  const identity = n => n
  const spy = jest.fn()

  repo.addDomain('test', {
    getInitialState() {
      return 0
    },
    register() {
      return { [identity] : (_, next) => next }
    }
  })

  repo.on('change', spy)

  repo.push(identity, 1)

  expect(spy).toHaveBeenCalledTimes(1)
})

describe('Efficiency', function() {

  it('actions are not dispatched twice with 0 history', () => {
    const parent = new Microcosm({ maxHistory: 0 })
    const handler = jest.fn()
    const action = n => n

    parent.addDomain('one', {
      register () {
        return {
          [action] : handler
        }
      }
    })

    parent.patch()
    parent.push(action)
    parent.patch()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('actions are only dispatched once with infinite history', () => {
    const parent = new Microcosm({ maxHistory: Infinity })
    const handler = jest.fn()
    const action = n => n

    parent.addDomain('one', {
      register () {
        return {
          [action] : handler
        }
      }
    })

    parent.patch()
    parent.push(action)
    parent.patch()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('actions are only dispatched once with fixed size history', () => {
    const parent = new Microcosm({ maxHistory: 1 })
    const handler = jest.fn()
    const action = n => n

    parent.addDomain('one', {
      register () {
        return {
          [action] : handler
        }
      }
    })

    parent.patch()
    parent.push(action)
    parent.patch()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('actions only dispatch duplicatively to address races', () => {
    const repo = new Microcosm({ maxHistory: 1 })
    const handler = jest.fn()
    const action = n => n

    repo.addDomain('one', {
      register () {
        return {
          [action] : handler
        }
      }
    })

    const one = repo.append(action)
    const two = repo.append(action)

    two.resolve()
    one.resolve()

    expect(handler).toHaveBeenCalledTimes(3)
  })

  it('pushing an action that nothing responds to will not result a change event', () => {
    const repo = new Microcosm()
    const spy = jest.fn()

    repo.addDomain('test', {})
    repo.on('change', spy)

    repo.push('whatever')

    expect(spy).toHaveBeenCalledTimes(0)
  })

})
