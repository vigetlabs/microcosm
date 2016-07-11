import test from 'ava'
import Microcosm from '../src/microcosm'

test('deserializes when replace is invoked', t => {
  const app = new Microcosm()

  app.addStore('dummy', function() {
    return {
      deserialize: state => state.toUpperCase()
    }
  })

  app.replace({ dummy: 'different' })

  t.is(app.state.dummy, 'DIFFERENT')
})

test('it will not deserialize null', t => {
  const app = new Microcosm()

  t.deepEqual(app.deserialize(null), {})
})

test('throws an error if asked to push a non-function value', t => {
  const app = new Microcosm()

  t.throws(function() {
    app.push(null)
  }, TypeError)
})

test('can manipulate how many transactions are merged', t => {
  const app = new Microcosm({ maxHistory: 5 })
  const identity = n => n

  app.push(identity, 1)
  app.push(identity, 2)
  app.push(identity, 3)
  app.push(identity, 4)
  app.push(identity, 5)

  t.is(app.history.size(), 5)
  app.push(identity, 6)

  t.is(app.history.size(), 5)
  t.deepEqual(app.history.reduce((a, b) => a.concat(b.payload), []), [ 2, 3, 4, 5, 6 ])
})

test('can partially apply push', t => {
  t.plan(1)

  const app = new Microcosm()

  const action = function (...args) {
    t.deepEqual(args, [ 1, 2, 3 ])
  }

  app.prepare(action, 1, 2)(3)
})

test('can checkout a prior state', t => {
  const app = new Microcosm({ maxHistory: Infinity })
  const action = n => n

  app.addStore('number', function() {
    return {
      [action]: (a, b) => b
    }
  })

  app.push(action, 1)
  app.push(action, 2)
  app.push(action, 3)

  app.checkout(app.history.root)

  t.is(app.state.number, 1)
})
