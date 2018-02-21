import { Microcosm } from 'microcosm'

describe('Effect::register', function() {
  it('invokes when an action completes', function() {
    const repo = new Microcosm()
    const test = n => n

    const Effect = {
      handler: jest.fn(),
      register() {
        return {
          [test]: this.handler
        }
      }
    }

    repo.addEffect(Effect)

    repo.push(test, true)

    expect(Effect.handler).toHaveBeenCalledWith(repo, true)
  })

  it('invokes within the scope of the effect', function() {
    const repo = new Microcosm()
    const test = n => n
    const spy = jest.fn()

    const Effect = {
      test: true,
      handler() {
        spy(this.test)
      },
      register() {
        return {
          [test]: this.handler
        }
      }
    }

    repo.addEffect(Effect)

    repo.push(test, true)

    expect(spy).toHaveBeenCalledWith(true)
  })

  it('is only called once - at reconciliation', async () => {
    const repo = new Microcosm()
    const test = n => new Promise(resolve => setTimeout(resolve, n))
    const handler = jest.fn()

    repo.addEffect({
      register() {
        return {
          [test]: handler
        }
      }
    })

    await Promise.all([repo.push(test, 10), repo.push(test, 0)])

    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('does not need to register', function() {
    const repo = new Microcosm()
    repo.addEffect({})
    repo.push(n => n)
  })

  it('does not respond to all handlers', function() {
    const repo = new Microcosm()

    class Effect {
      register() {
        return {}
      }
    }

    repo.addEffect(Effect)

    repo.push('missing', true)
  })

  it('repo state should be up to date by the time of effect dispatch', function() {
    expect.assertions(1)

    const repo = new Microcosm()
    const test = n => n

    repo.addDomain('test', {
      getInitialState() {
        return false
      },
      register() {
        return {
          [test]: (a, b) => {
            return b
          }
        }
      }
    })

    const Effect = {
      handler(repo) {
        expect(repo).toHaveState('test', true)
      },
      register() {
        return {
          [test]: this.handler
        }
      }
    }

    repo.addEffect(Effect)

    repo.push(test, true)
  })

  describe('statuses', function() {
    it('listens to next', async () => {
      let repo = new Microcosm()
      let handler = jest.fn()
      let action = () => action => {
        action.next(1)
        action.next(2)
        setTimeout(action.complete)
      }

      repo.addEffect({
        register() {
          return {
            [action]: {
              next: handler
            }
          }
        }
      })

      await repo.push(action)

      expect(handler).toHaveBeenCalledWith(repo, 1)
      expect(handler).toHaveBeenCalledWith(repo, 2)
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('listens to complete', async () => {
      let repo = new Microcosm()
      let handler = jest.fn()
      let action = () => action => {
        action.next(true)
        action.complete()
      }

      repo.addEffect({
        register() {
          return {
            [action]: {
              complete: handler
            }
          }
        }
      })

      await repo.push(action)

      expect(handler).toHaveBeenCalledWith(repo, true)
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('listens to error', async () => {
      let repo = new Microcosm()
      let handler = jest.fn()
      let action = () => action => action.error(true)

      repo.addEffect({
        register() {
          return {
            [action]: {
              error: handler
            }
          }
        }
      })

      try {
        await repo.push(action)
      } catch (error) {
        expect(error).toBe(true)
      }

      expect(handler).toHaveBeenCalledWith(repo, true)
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})
