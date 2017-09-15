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

  it('is only called once  - at reconciliation', function() {
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

    const one = repo.append(test)
    const two = repo.append(test)

    two.resolve()
    one.resolve()

    expect(Effect.handler).toHaveBeenCalledTimes(2)
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
            open: handler,
            update: handler,
            reject: handler,
            resolve: handler,
            cancel: handler
          }
        }
      }
    })

    expect(effect).toRegister(action, 'open')
    expect(effect).toRegister(action, 'update')
    expect(effect).toRegister(action, 'reject')
    expect(effect).toRegister(action, 'resolve')
    expect(effect).toRegister(action, 'cancel')
  })
})
