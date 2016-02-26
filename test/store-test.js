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

    app.start()

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

  context('when a microcosm is pushes an action', function() {
    let action = n => n

    beforeEach(function(done) {
      this.app = new Microcosm()
      this.app.start()
      this.app.push(action, null, done)
    })

    context ('and a new store is added', function() {

      beforeEach(function() {
        this.app.addStore('test', function() {
          return {
            [action]: () => true
          }
        })
      })

      context('and that action is pushed again', function () {
        beforeEach(function(done) {
          this.app.push(action, null, done)
        })

        it ('accounts for the new handler', function () {
          assert.equal(this.app.state.test, true)
        })
      })
    })
  })
})
