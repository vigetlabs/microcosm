import Microcosm from '../src/microcosm'

test('patch partially updates', function () {
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

test('it will not deserialize null', function () {
  const repo = new Microcosm()

  expect(repo.deserialize(null)).toEqual({})
})

test('throws an error if asked to push a non-function value', function () {
  const repo = new Microcosm()

  expect(() => repo.push(null)).toThrow(TypeError)
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

  repo.push(action, 1)
  repo.push(action, 2)
  repo.push(action, 3)

  repo.checkout(repo.history.root)

  expect(repo.state.number).toEqual(1)
})

test('if pure, it will not emit a change if state is shallowly equal', function () {
  const repo = new Microcosm({ pure: true })
  const identity = n => n

  repo.addDomain('test', {
    getInitialState() {
      return 0
    },
    register() {
      return { [identity] : (state, next) => next }
    }
  })

  const first = repo.state

  repo.push(identity, 0)

  expect(first).toBe(repo.state)
})

test('if pure, it will emit a change if state is not shallowly equal', function () {
  const repo = new Microcosm({ pure: true })
  const identity = n => n

  repo.addDomain('test', {
    getInitialState() {
      return 0
    },
    register() {
      return { [identity] : (state, next) => next }
    }
  })

  const first = repo.state

  repo.push(identity, 1)

  expect(repo.state).not.toEqual(first)
})
