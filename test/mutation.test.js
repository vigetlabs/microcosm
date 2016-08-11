import test from 'ava'
import Microcosm from '../src/microcosm'

test.cb('writes to application state', t => {
  const action = function() {}
  const repo = new Microcosm()

  repo.addStore(function() {
    return {
      getInitialState() {
        return { test: false }
      },
      [action](state) {
        state.test = true
        return state
      }
    }
  })

  repo.push(action, true).onDone(() => {
    t.is(repo.state.test, true)
    t.end()
  })
})
