import Microcosm from '../src/Microcosm'
import assert from 'assert'

describe('Stores', function() {

  it ('a store can be a function', function(done) {
    let action = function() {}
    let app = new Microcosm()

    app.addStore('test', function() {
      return {
        [action]: () => true
      }
    })

    app.push(action, []).onDone(function() {
      assert(app.state.test)
      done()
    })
  })

  it ('can mount a store at an empty key path', function() {
    let app = new Microcosm()

    app.addStore({
      getInitialState() {
        return { test: true }
      }
    })

    assert(app.state.test)
  })

  context('when a microcosm is pushes an action', function() {
    let action = n => n

    beforeEach(function(done) {
      this.app = new Microcosm()
      this.app.push(action).onDone(done)
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
          this.app.push(action).onDone(done)
        })

        it ('accounts for the new handler', function () {
          assert.equal(this.app.state.test, true)
        })
      })
    })
  })
})
