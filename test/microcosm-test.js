import Action     from  './fixtures/Action'
import DummyStore from './fixtures/dummy-store'
import Microcosm  from '../src/microcosm'
import assert     from 'assert'

describe('Microcosm', function() {
  let app;

  beforeEach(function() {
    app = new Microcosm()
    app.addStore('dummy', DummyStore)
  })

  it ('can be extended - Address loose mode Babel bug', function() {
    class First  extends Microcosm {}
    class Second extends First {}

    assert.ok(new First() instanceof Microcosm)
    assert.ok(new Second() instanceof First)
  })

  it ('getInitialState collects starting state for all registered stores', function() {
    let app = new Microcosm()

    app.addStore('test', {
      getInitialState() {
        return true
      }
    })

    assert.deepEqual(app.getInitialState(), { test: true })
  })

  it ('deserializes when replace is invoked', function() {
    app.on('change', function() {
      assert.equal(app.state.dummy, 'DIFFERENT')
    })

    app.replace({ dummy: 'different' })
  })

  it ('throws an error if asked to push a non-function value', function(done) {
    try {
      app.push(null)
    } catch(x) {
      assert(x instanceof TypeError)
      done()
    }
  })

  it ('can manipulate how many transactions are merged', function() {
    let app = new Microcosm({ maxHistory: 5 })

    let identity = n => n

    app.push(identity, 1)
    app.push(identity, 2)
    app.push(identity, 3)
    app.push(identity, 4)
    app.push(identity, 5)

    assert.equal(app.history.size(), 5)
    app.push(identity, 6)

    assert.equal(app.history.size(), 5)
    assert.deepEqual(app.history.reduce((a, b) => a.concat(b.payload), []), [ 2, 3, 4, 5, 6 ])
  })

  it ('throws an error if asked to push an undefined action', function() {
    assert.throws(function() {
      app.push(undefined)
    })
  })
})
