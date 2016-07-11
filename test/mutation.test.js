import test from 'ava'
import Microcosm from '../src/microcosm'

test.cb('writes to application state', t => {
  const action = function() {}
  const app = new Microcosm()

  app.addStore(function() {
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

  app.push(action, true).onDone(() => {
    t.is(app.state.test, true)
    t.end()
  })
})
