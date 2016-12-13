import Microcosm from '../src/microcosm'

test('invokes an effect when an action completes', function () {
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

test('invokes an effect within the scope of the effect', function () {
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

test('an effect is only called once  - at reconciliation', function () {
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

test('an effect may be a class', function () {
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

test('an effect is setup with options', function () {
  const repo = new Microcosm()
  const spy = jest.fn()

  class Effect {
    setup = spy
  }

  repo.addEffect(Effect, { test: true })

  expect(spy).toHaveBeenCalledWith(repo, { test: true })
})

test('does not need to register', function () {
  const repo = new Microcosm()
  repo.addEffect({})
  repo.push(n => n)
})

test('does not respond to all handlers', function () {
  const repo = new Microcosm()

  class Effect {
    register() {
      return {}
    }
  }

  repo.addEffect(Effect)

  repo.push('missing', true)
})

describe('teardown', function() {
  test('an effect is torn down with the repo', function () {
    const repo = new Microcosm()
    const spy = jest.fn()

    class Effect {
      teardown = spy
    }

    repo.addEffect(Effect)

    repo.teardown()

    expect(spy).toHaveBeenCalledWith(repo)
  })

  test('does not need to implement teardown', function () {
    const repo = new Microcosm()
    repo.addEffect(class Effect {})
    repo.teardown()
  })
})
