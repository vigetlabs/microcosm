import Microcosm from '../src/microcosm'
import assert from 'assert'

describe('Stores', function() {

  it ('a store can be a function', function() {
    let app    = new Microcosm()
    let action = n => n

    app.addStore('test', function() {
      return {
        [action]: () => true
      }
    })

    app.push(action)

    assert.equal(app.state.test, true)
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

    beforeEach(function() {
      this.app = new Microcosm()
      this.app.push(action)
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
        beforeEach(function() {
          this.app.push(action)
        })

        it ('accounts for the new handler', function () {
          assert.equal(this.app.state.test, true)
        })
      })
    })
  })
})
