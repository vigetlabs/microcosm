let Microcosm = require('../src/Microcosm')
let Transaction = require('../src/Transaction')
let assert = require('assert')
let send = require('../src/send')
let lifecycle = require('../src/lifecycle')

describe('sending actions', function() {

  let action = a => a

  it ('always sends actions in the context of the store', function(done) {
    let app = new Microcosm()

    let store = {
      register() {
        return {
          [action](state) {
            assert.equal(this, store)
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

    app.start()

    app.push(action, [], function() {
      assert.equal(app.state.test, 'test')
      done()
    })
  })

  it ('allows handlers to not be functions', function(done) {
    let app = new Microcosm()

    app.addStore('test', {
      register() {
        return {
          [action]: 5
        }
      }
    })

    app.push(action, [], function() {
      assert.equal(app.state.test, 5)
      done()
    })
  })

  it ('sends all application state as the third argument', function(done) {
    let app = new Microcosm()

    app.addStore('test', {
      register() {
        return {
          [action](subset, body, state) {
            assert.deepEqual(state, app.state)
            done()
          }
        }
      }
    })

    app.push(action)
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

    app.start()

    app.push(action, [], function() {
      assert.equal(app.state.one, 3)
    })
 })

  it ('can make decisions from all app state based on prior operations', function() {
    let app = new Microcosm()

    app.addStore('count', {
      getInitialState() {
        return 0
      },
      register() {
        return { [action]: total => total + 1 }
      }
    })

    app.addStore('isEven', {
      register() {
        return {
          [action]: (isEven, _, state) => !(state.count % 2)
        }
      }
    })

    app.start()

    app.push(action, [], function() {
      assert.equal(app.state.count, 1)
      assert.equal(app.state.isEven, false)
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

      app.push(lifecycle.willStart, [], function() {
        assert.equal(app.state.test, 'test')
      })
    })

    it ('allows lifecycle methods as registered actions', function() {
      let app = new Microcosm()

      app.addStore('test', {
        register() {
          return {
            [lifecycle.willStart]: 'test'
          }
        }
      })

      app.start(function() {
        assert.equal(app.state.test, 'test')
      })
    })

    it ('warns if a store registers to an action, but it is undefined', function (done) {
      let app  = new Microcosm()
      let warn = console.warn

      console.warn = function (message) {
        assert.equal(message, 'Store for test is registered to the action getInitialState, but the handler is undefined!')
        console.warn = warn
        done()
      }

      app.addStore('test', {
        register() {
          return {
            [lifecycle.willStart]: this.undefinedMember
          }
        }
      })

      app.start()
    })

  })

})
