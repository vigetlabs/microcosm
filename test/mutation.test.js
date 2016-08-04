import test from 'ava'
import Microcosm from '../src/microcosm'

test.cb('writes to repo state', t => {
  const action = function() {}
  const repo = new Microcosm()

  repo.addDomain({
    getInitialState() {
      return { test: false }
    },
    register() {
      return {
        [action](state) {
          state.test = true
          return state
        }
      }
    }
  })

  repo.push(action, true).onDone(() => {
    t.is(repo.state.test, true)
    t.end()
  })
})
