import Microcosm from 'microcosm'

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

  it('is only called once  - at reconciliation', async () => {
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
          [test]: (a, b) => b
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

  it('allows domains nested registration methods', function() {
    let repo = new Microcosm()
    let handler = jest.fn()
    let action = n => n

    let effect = repo.addEffect({
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

    expect(effect).toRegister(action, 'start')
    expect(effect).toRegister(action, 'next')
    expect(effect).toRegister(action, 'error')
    expect(effect).toRegister(action, 'complete')
    expect(effect).toRegister(action, 'cancel')
  })
})
