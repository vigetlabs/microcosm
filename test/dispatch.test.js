import test from 'ava'
import Microcosm from '../src/microcosm'

test('returns state if there are no handlers', t => {
  const app = new Microcosm()
  const old = app.state

  app.push(n => n)

  t.is(app.state, old)
})

test('does not mutate base state on prior dispatches', t => {
  const app = new Microcosm()

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
