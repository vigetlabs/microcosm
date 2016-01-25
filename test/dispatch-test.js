import Microcosm from '../src/Microcosm'
import Transaction from '../src/Transaction'
import dispatch from '../src/dispatch'
import assert from 'assert'

describe('dispatch', function() {

  it ('returns state if not active', function() {
    let transaction = new Transaction('foo')
    let store = {
      register() {
        return { foo: true }
      }
    }

    let state = {}
    let next  = dispatch([ [ 'test', store ] ], state, new Transaction('test'))

    assert.equal(next, state)
  })

  it ('does not mutate base state on prior dispatches', function() {
    var app = new Microcosm()

    function mutation() {
      return true
    }

    app.addStore({
      getInitialState() {
        return {
          toggled: false
        }
      },

      register() {
        return {
          [mutation](state, next) {
            state.toggled = !state.toggled
            return state
          }
        }
      }
    })

    app.start()

    app.push(mutation)
    assert.equal(app.history.size(), 0)
    assert.equal(app.state.toggled, true)

    app.push(mutation)
    assert.equal(app.history.size(), 0)
    assert.equal(app.state.toggled, false)

    app.push(mutation)
    assert.equal(app.history.size(), 0)
    assert.equal(app.state.toggled, true)
  })

})
