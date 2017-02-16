import Microcosm from '../src/microcosm'

it('writes to repo state', function (done) {
  const action = function() {}
  const repo = new Microcosm()

  repo.addDomain(null, {
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
    expect(repo).toHaveState('test', true)
    done()
  })
})
