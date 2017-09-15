import Microcosm from 'microcosm'

describe('Mutations', function() {
  it('writes to repo state', function() {
    const identity = function() {}
    const repo = new Microcosm({ maxHistory: Infinity })

    repo.addDomain(null, {
      getInitialState() {
        return { test: false }
      },
      mutate(state) {
        state.test = true
        return state
      },
      register() {
        return {
          [identity]: this.mutate
        }
      }
    })

    repo.push(identity, true)

    expect(repo).toHaveState('test', true)
  })
})
