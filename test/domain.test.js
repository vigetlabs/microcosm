import Microcosm from '../src/microcosm'
import Domain from '../src/domain'
import logger from './helpers/logger'

test('it warns when extending from domain', function () {
  class Test extends Domain {}

  logger.record()

  new Test()

  expect(logger.last('warn')).toContain('Extending from Domain is deprecated')

  logger.restore()
})

describe('::shouldCommit', function () {

  test('is given initial state at the start', function () {
    const repo = new Microcosm()
    const test = jest.fn(() => false)

    class Counter {
      getInitialState() {
        return 0
      }
      get shouldCommit() {
        return test
      }
    }

    repo.addDomain('count', Counter)
    repo.patch()

    expect(test).toHaveBeenCalledWith(0, 0)
  })

  test('prevents commiting if returns false', function () {
    const repo = new Microcosm()
    const add  = n => n

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      shouldCommit(next, previous) {
        return Math.round(next) !== Math.round(previous)
      },
      register() {
        return {
          [add]: (a, b) => a + b
        }
      }
    })

    let first = repo.state

    return repo.push(add, 0.1).onDone(function() {
      expect(repo.state.count).toBe(first.count)
    })
  })

})

describe('::commit', function() {

  test('always writes for the first time', function() {
    let repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState() {
        return true
      },
      shouldCommit(next, last) {
        return next !== last
      }
    })

    expect(repo.state.test).toEqual(true)
  })

})


describe('Creation modes', function () {

  test('object - primitive', function () {
    const repo = new Microcosm()

    repo.addDomain('count', {
      getInitialState() {
        return 0
      }
    })

    expect(repo.state.count).toBe(0)
  })

  test('object - original primitive is not mutated', function () {
    const repo = new Microcosm()

    const MyDomain = {
      getInitialState() {
        return 0
      }
    }

    repo.addDomain('count', MyDomain)

    expect(MyDomain.setup).toBeUndefined()
  })

  test('class - simple', function () {
    const repo = new Microcosm()

    class Counter {
      getInitialState() {
        return 0
      }
    }

    repo.addDomain('count', Counter)

    expect(repo.state.count).toBe(0)
  })

  test('class - extends domain', function () {
    const repo = new Microcosm()

    class Counter {
      getInitialState() {
        return 0
      }
    }

    repo.addDomain('count', Counter)

    expect(repo.state.count).toBe(0)
  })

})

describe('Lifecycle', function() {

  test('setup - gets called with a reference to the repo and options', function () {
    const repo = new Microcosm()
    const test = jest.fn()

    class Counter {
      get setup () {
        return test
      }
    }

    repo.addDomain('count', Counter, { test: true })

    expect(test).toHaveBeenCalledWith(repo, { test: true })
  })

  test('teardown - gets called with a reference to the repo', function () {
    const repo = new Microcosm()
    const test = jest.fn()

    class Counter {
      get teardown () {
        return test
      }
    }

    repo.addDomain('count', Counter, { test: true })

    repo.teardown()

    expect(test).toHaveBeenCalledWith(repo)
  })

})

describe('Action registration', function() {

  test('warns if a register handler is undefined', function () {
    const repo = new Microcosm()
    const action = n => n

    logger.record()

    repo.addDomain('key', {
      register() {
        return {
          [action] : undefined
        }
      }
    })

    repo.push(action)

    expect(logger.count('warn')).toEqual(1)

    logger.restore()
  })

})
