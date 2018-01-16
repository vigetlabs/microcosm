import Microcosm from 'microcosm'

describe('Mutations', function() {
  it('writes to repo state', function() {
    const repo = new Microcosm({ debug: true })

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
          test: this.mutate
        }
      }
    })

    repo.push('test', true)

    expect(repo).toHaveState('test.key', true)
  })
})
