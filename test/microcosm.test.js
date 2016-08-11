import test from 'ava'
import Microcosm from '../src/microcosm'

test('deserializes when replace is invoked', t => {
  const repo = new Microcosm()

  repo.addStore('dummy', function() {
    return {
      deserialize: state => state.toUpperCase()
    }
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

  repo.addStore('number', function() {
    return {
      [action]: (a, b) => b
    }
  })

  repo.push(action, 1)
  repo.push(action, 2)
  repo.push(action, 3)

  repo.checkout(repo.history.root)

  t.is(repo.state.number, 1)
})
