import Microcosm from '../src/Microcosm'
import assert from 'assert'

describe('dispatch', function() {

  it ('returns state if there are no handlers', function() {
    var app = new Microcosm()

    let old  = app.state
    let next = app.dispatch(old, 'test')

    assert.equal(next, old)
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
