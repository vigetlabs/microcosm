import Microcosm from 'microcosm'

describe('Mutations', function() {
  it('writes to repo state', function() {
    const identity = function() {}
    const repo = new Microcosm({ maxHistory: Infinity })

    repo.addDomain('test', {
      getInitialState() {
        return { key: false }
      },
      mutate(state) {
        state.key = true
        return state
      },
      register() {
        return {
          [identity]: this.mutate
        }
      }
    })

    repo.push(identity, true)

    expect(repo).toHaveState('test.key', true)
  })
})
