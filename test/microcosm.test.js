import test from 'ava'
import Microcosm from '../src/microcosm'
import console from './helpers/console'

test('deserializes when replace is invoked', t => {
  const repo = new Microcosm()

  repo.addDomain('dummy', {
    deserialize: state => state.toUpperCase()
  })

  repo.replace({ dummy: 'different' })

  t.is(repo.state.dummy, 'DIFFERENT')
})

test('it will not deserialize null', t => {
  const repo = new Microcosm()

  t.deepEqual(repo.deserialize(null), {})
})

test('throws an error if asked to push a non-function value', t => {
  const repo = new Microcosm()

  t.throws(function() {
    repo.push(null)
  }, TypeError)
})

test('can manipulate how many transactions are merged', t => {
  const repo = new Microcosm({ maxHistory: 5 })
  const identity = n => n

  repo.push(identity, 1)
  repo.push(identity, 2)
  repo.push(identity, 3)
  repo.push(identity, 4)
  repo.push(identity, 5)

  t.is(repo.history.size(), 5)
  repo.push(identity, 6)

  t.is(repo.history.size(), 5)
  t.deepEqual(repo.history.reduce((a, b) => a.concat(b.payload), []), [ 2, 3, 4, 5, 6 ])
})

test('can partially apply push', t => {
  t.plan(1)

  const repo = new Microcosm()

  const action = function (...args) {
    t.deepEqual(args, [ 1, 2, 3 ])
  }

  repo.prepare(action, 1, 2)(3)
})

test('can checkout a prior state', t => {
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

  t.is(repo.state.number, 1)
})

test('if pure, it will not emit a change if state is shallowly equal', t => {
  const repo = new Microcosm({ pure: true })
  const identity = n => n

  t.plan(1)

  repo.addDomain('test', {
    getInitialState() {
      return 0
    },
    register() {
      return { [identity] : (state, next) => next }
    }
  })

  const first = repo.state

  repo.push(identity, 0).onDone(function() {
    t.is(first, repo.state)
  })
})

test('if pure, it will emit a change if state is not shallowly equal', t => {
  const repo = new Microcosm({ pure: true })
  const identity = n => n

  t.plan(1)

  repo.addDomain('test', {
    getInitialState() {
      return 0
    },
    register() {
      return { [identity] : (state, next) => next }
    }
  })

  const first = repo.state

  repo.push(identity, 1).onDone(function() {
    t.not(repo.state, first)
  })
})

test('warns when using addStore', t => {
  const repo = new Microcosm({ pure: true })

  console.record()

  repo.addStore('test', {})

  t.is(console.count('warn'), 1)

  console.restore()
})
