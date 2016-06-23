import Microcosm from '../src/microcosm'
import assert from 'assert'
import lifecycle from '../src/lifecycle'

describe('sending actions', function() {

  let action = a => a

  it ('always sends actions in the context of the store', function(done) {
    let app = new Microcosm()

    let store = {
      test: true,

      register() {
        return {
          [action](state) {
            assert.equal(this.test, true)
            done()
          }
        }
      }
    }

    app.addStore('test', store).push(action)
  })

  it ('returns the same state if a handler is not provided', function(done) {
    let app = new Microcosm()

    app.addStore('test', {
      getInitialState() {
        return 'test'
      }
    })

    app.push(action).onDone(function() {
      assert.equal(app.state.test, 'test')
      done()
    })
  })

  it ('sends passes state from previous store operations', function() {
    let app = new Microcosm()

    let store = {
      getInitialState() {
        return 1
      },
      register() {
        return { [action]: total => total + 1 }
      }
    }

    app.addStore('one', store)
       .addStore('one', store)

    app.push(action).onDone(function() {
      assert.equal(app.state.one, 3)
    })
  })

  describe('Lifecycle passthrough', function() {

    it ('allows defined lifecycle methods to bypass the register function', function() {
      let app = new Microcosm()

      app.addStore('test', {
        getInitialState() {
          return 'test'
        }
      })

      app.push(lifecycle.willStart).onDone(function() {
        assert.equal(app.state.test, 'test')
      })
    })

    it ('allows lifecycle methods as registered actions', function() {
      let app = new Microcosm()

      app.addStore('test', {
        register() {
          return {
            [lifecycle.willStart]: () => 'test'
          }
        }
      })

      assert.equal(app.state.test, 'test')
    })
  })
})
