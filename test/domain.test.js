import Microcosm from '../src/microcosm'
import Domain from '../src/domain'
import logger from './helpers/logger'

describe('::shouldCommit', function () {

  test('is given initial state at the start', function () {
    const repo = new Microcosm()
    const test = jest.fn(() => false)

    class Counter extends Domain {
      getInitialState() {
        return 0
      }
      get shouldCommit() {
        return test
      }
    }

    repo.addDomain('count', Counter)

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

    class Counter extends Domain{
      getInitialState() {
        return 0
      }
    }

    repo.addDomain('count', Counter)

    expect(repo.state.count).toBe(0)
  })

})

describe('Lifecycle', function() {

  test('setup - gets called with a reference to the repo', function () {
    const repo = new Microcosm()
    const test = jest.fn()

    class Counter extends Domain {
      get setup () {
        return test
      }
    }

    repo.addDomain('count', Counter)

    expect(test).toHaveBeenCalledWith(repo)
  })

  test('teardown - gets called with a reference to the repo', function () {
    const repo = new Microcosm()
    const test = jest.fn()

    class Counter extends Domain {
      get teardown () {
        return test
      }
    }

    repo.addDomain('count', Counter)

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
