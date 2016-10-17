import Microcosm from '../src/microcosm'
import Domain from '../src/domain'
import logger from './helpers/logger'

test('domains can be objects with lifecycle methods', function () {
  const repo = new Microcosm()

  repo.addDomain('key', {
    getInitialState: () => true
  })

  expect(repo.state.key).toBe(true)
})

test('warns if a register handler is undefined', function () {
  const repo = new Microcosm()
  const action = n => n

  logger.record()

  repo.addDomain('key', {
    register() {
      return {
        [action]: undefined
      }
    }
  })

  repo.push(action)

  expect(logger.count('warn')).toEqual(1)

  logger.restore()
})

test('can control if state should be committed', function () {
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

test('domain have a setup step', function () {
  const repo = new Microcosm()
  const test = jest.fn()

  class Counter extends Domain {
    get setup() {
      return test
    }
  }

  repo.addDomain('count', Counter)

  expect(test).toHaveBeenCalled()
})

test('last state in shouldCommit starts as initial state', function () {
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
