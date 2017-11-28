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

    repo.push(action)
  })

  it('returns the same state if a handler is not provided', async () => {
    let repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState() {
        return 'test'
      }
    })

    await repo.push(action)

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
              open: handler,
              update: handler,
              reject: handler,
              resolve: handler,
              cancel: handler
            }
          }
        }
      })

      expect(domain).toRegister(action, 'open')
      expect(domain).toRegister(action, 'update')
      expect(domain).toRegister(action, 'reject')
      expect(domain).toRegister(action, 'resolve')
      expect(domain).toRegister(action, 'cancel')
    })
  })
})
