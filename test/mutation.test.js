import Microcosm from '../src/microcosm'

test('writes to repo state', function (done) {
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
    expect(repo.state.test).toBe(true)
    done()
  })
})
