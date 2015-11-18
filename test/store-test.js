let Microcosm = require('../src/Microcosm')
let assert    = require('assert')

describe('Stores', function() {

  it ('a store can be a function', function(done) {
    let action = function() {}
    let app = new Microcosm()

    app.addStore('test', function() {
      return {
        [action]: true
      }
    })

    app.push(action, [], function() {
      assert(app.state.test)
      done()
    })
  })

  it ('throws if not given a store', function() {
    let app   = new Microcosm()
    let error = new RegExp('Expected a store object or function')

    assert.throws(() => app.addStore('test'), error)
    assert.throws(() => app.addStore('test', 'fiz'), error)
    assert.throws(() => app.addStore('test', null), error)
    assert.throws(() => app.addStore(null), error)
  })

  it ('can mount a store at a nested key path', function() {
    let app = new Microcosm()

    app.addStore([ 'foo', 'bar' ], {
      getInitialState() {
        return true
      }
    })

    app.start()

    assert(app.state.foo.bar)
  })

  it ('can mount a store at an empty key path', function() {
    let app = new Microcosm()

    app.addStore({
      getInitialState() {
        return { test: true }
      }
    })

    app.start()

    assert(app.state.test)
  })
})
