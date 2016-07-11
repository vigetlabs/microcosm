import test from 'ava'
import Microcosm from '../src/microcosm'

test('returns state if there are no handlers', t => {
  var app = new Microcosm()

  let old  = app.state
  let next = app.dispatch(old, 'test')

  t.is(next, old)
})

test('does not mutate base state on prior dispatches', t => {
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
        [mutation](state) {
          state.toggled = !state.toggled
          return state
        }
      }
    }
  })

  app.push(mutation)

  t.is(app.history.size(), 0)
  t.is(app.state.toggled, true)

  app.push(mutation)
  t.is(app.history.size(), 0)
  t.is(app.state.toggled, false)

  app.push(mutation)
  t.is(app.history.size(), 0)
  t.is(app.state.toggled, true)
})
