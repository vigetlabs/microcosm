import Microcosm from '../src/microcosm'

it('invokes an effect when an action completes', function () {
  const repo = new Microcosm()
  const test = n => n

  const Effect = {
    handler: jest.fn(),
    register() {
      return {
        [test] : this.handler
      }
    }
  }

  repo.addEffect(Effect)

  repo.push(test, true)

  expect(Effect.handler).toHaveBeenCalledWith(repo, true)
})

it('invokes an effect within the scope of the effect', function () {
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
        [test] : this.handler
      }
    }
  }

  repo.addEffect(Effect)

  repo.push(test, true)

  expect(spy).toHaveBeenCalledWith(true)
})

it('an effect is only called once  - at reconciliation', function () {
  const repo = new Microcosm()
  const test = n => n

  const Effect = {
    handler: jest.fn(),
    register() {
      return {
        [test] : this.handler
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

it('an effect may be a class', function () {
  const repo = new Microcosm()
  const test = n => n
  const spy  = jest.fn()

  class Effect {
    handler = spy

    register() {
      return {
        [test] : this.handler
      }
    }
  }

  repo.addEffect(Effect)

  repo.push(test, true)

  expect(spy).toHaveBeenCalledWith(repo, true)
})

it('an effect is setup with options', function () {
  const repo = new Microcosm()
  const spy = jest.fn()

  class Effect {
    setup = spy
  }

  repo.addEffect(Effect, { test: true })

  expect(spy).toHaveBeenCalledWith(repo, { test: true })
})

it('does not need to register', function () {
  const repo = new Microcosm()
  repo.addEffect({})
  repo.push(n => n)
})

it('does not respond to all handlers', function () {
  const repo = new Microcosm()

  class Effect {
    register() {
      return {}
    }
  }

  repo.addEffect(Effect)

  repo.push('missing', true)
})

describe('state', function () {

  it('repo state should be up to date by the time of effect dispatch', function () {
    expect.assertions(1)

    const repo = new Microcosm()
    const test = n => n

    repo.addDomain('test', {
      getInitialState () {
        return false
      },
      register () {
        return {
          [test]: (a, b) => b
        }
      }
    })

    const Effect = {
      handler (repo) {
        expect(repo.state.test).toBe(true)
      },
      register() {
        return {
          [test] : this.handler
        }
      }
    }

    repo.addEffect(Effect)

    repo.push(test, true)
  })

})

describe('teardown', function() {
  it('an effect is torn down with the repo', function () {
    const repo = new Microcosm()
    const spy = jest.fn()

    class Effect {
      teardown = spy
    }

    repo.addEffect(Effect)

    repo.teardown()

    expect(spy).toHaveBeenCalledWith(repo)
  })

  it('does not need to implement teardown', function () {
    const repo = new Microcosm()
    repo.addEffect(class Effect {})
    repo.teardown()
  })
})
