import Microcosm from '../src/microcosm'

test('it will not deserialize null', function () {
  const repo = new Microcosm()

  expect(repo.deserialize(null)).toEqual({})
})

test('throws an error if asked to push a non-function value', function () {
  const repo = new Microcosm()

  expect(() => repo.push(null)).toThrow(/expected string or function/)
})

test('can manipulate how many transactions are merged', function () {
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
  expect(repo.history.toArray().map(a => a.payload)).toEqual([ 2, 3, 4, 5, 6 ])
})

test('can partially apply push', function () {
  const repo = new Microcosm()
  const action = jest.fn()

  repo.prepare(action, 1, 2)(3)

  expect(action).toBeCalledWith(1,2,3)
})

test('can checkout a prior state', function () {
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

test('it will not emit a change if state is shallowly equal', function () {
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

test('it will emit a change if state is not shallowly equal', function () {
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

describe('patch', function () {

  test('patch partially updates state', function () {
    const repo = new Microcosm()

    repo.addDomain('a', {
      getInitialState: n => true
    })

    repo.addDomain('b', {
      getInitialState: n => true
    })

    repo.patch({ a: false })

    expect(repo.state.a).toBe(false)
    expect(repo.state.b).toBe(true)
  })

  test('patch can deserialize the provided data', function () {
    const repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState: n => '',
      deserialize: n => n.toUpperCase()
    })

    repo.patch({ test: 'deserialize' }, true)

    expect(repo.state.test).toBe('DESERIALIZE')
  })

})

describe('reset', function () {

  test('reverts to the initial state', function () {
    const repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState: n => true
    })

    repo.patch({ test: false })

    expect(repo.state.test).toBe(false)

    repo.reset()

    expect(repo.state.test).toBe(true)
  })

  test('can fold in a data parameter', function () {
    const repo = new Microcosm()

    repo.addDomain('first', {
      getInitialState: n => true
    })

    repo.reset({ second: true })

    expect(repo.state.first).toBe(true)
    expect(repo.state.second).toBe(true)
  })

  test('can deserialized the data parameter', function () {
    const repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState: n => '',
      deserialize: n => n.toUpperCase()
    })

    repo.reset({ test: 'deserialize' }, true)

    expect(repo.state.test).toBe('DESERIALIZE')
  })

})

describe('Efficiency', function() {

  test('actions are not dispatched twice with 0 history', () => {
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

  test('actions are only dispatched once with infinite history', () => {
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

  test('actions are only dispatched once with fixed size history', () => {
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

  test('actions only dispatch duplicatively to address races', () => {
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

  test('pushing an action that nothing responds to will not result in an update', () => {
    const repo = new Microcosm()
    const spy = jest.fn()

    repo.addDomain('test', {
      commit: spy
    })

    repo.push('whatever')

    expect(spy).toHaveBeenCalledTimes(1)
  })

})
