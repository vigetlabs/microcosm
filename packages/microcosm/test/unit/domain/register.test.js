import Microcosm from 'microcosm'

describe('Domain::register', function() {
  it('sends actions in the context of the domain', function() {
    expect.assertions(1)

    let repo = new Microcosm()

    repo.addDomain('test', {
      test: true,
      register() {
        return {
          action() {
            expect(this.test).toBe(true)
          }
        }
      }
    })

    repo.push('action', true)
  })

  it('gets initial state', function() {
    let repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState: () => 0
    })

    expect(repo).toHaveState('test', 0)
  })

  it('counts', function() {
    let repo = new Microcosm({ debug: true })

    repo.addDomain('test', {
      getInitialState: () => 0,
      register() {
        return {
          add: (a, b) => {
            return a + b
          }
        }
      }
    })

    repo.push('add', 1)
    repo.push('add', 1)

    expect(repo.state.test).toBe(2)
  })

  it('returns the same state if a handler is not provided', async () => {
    let repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState() {
        return 'test'
      }
    })

    await repo.push('test')

    expect(repo).toHaveState('test', 'test')
  })
})
