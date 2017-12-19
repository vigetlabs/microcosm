import Microcosm from 'microcosm'

let action = a => a

describe('Domain::register', function() {
  it('sends actions in the context of the domain', function() {
    expect.assertions(1)

    let repo = new Microcosm()

    repo.addDomain('test', {
      test: true,

      register() {
        return {
          [action]() {
            expect(this.test).toBe(true)
          }
        }
      }
    })

    repo.push(action, true)
  })

  it('gets initial state', function() {
    let repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState: () => 0
    })

    expect(repo.state).toEqual({ test: 0 })
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

  describe('nesting', function() {
    it('allows domains nested registration methods', function() {
      let repo = new Microcosm()
      let handler = jest.fn()

      let domain = repo.addDomain('test', {
        register() {
          return {
            [action]: {
              start: handler,
              next: handler,
              error: handler,
              complete: handler,
              cancel: handler
            }
          }
        }
      })

      expect(domain).toRegister(action, 'start')
      expect(domain).toRegister(action, 'next')
      expect(domain).toRegister(action, 'complete')
      expect(domain).toRegister(action, 'error')
      expect(domain).toRegister(action, 'cancel')
    })
  })
})
