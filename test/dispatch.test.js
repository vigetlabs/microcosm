import test from 'ava'
import Microcosm from '../src/microcosm'

test('does not mutate base state on prior dispatches', t => {
  const repo = new Microcosm()

  function mutation() {
    return true
  }

  repo.addDomain({
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

  repo.push(mutation)

  t.is(repo.history.size, 0)
  t.is(repo.state.toggled, true)

  repo.push(mutation)
  t.is(repo.history.size, 0)
  t.is(repo.state.toggled, false)

  repo.push(mutation)
  t.is(repo.history.size, 0)
  t.is(repo.state.toggled, true)
})
