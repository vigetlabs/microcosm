import test from 'ava'
import Microcosm from '../src/microcosm'
import Domain from '../src/domain'
import logger from './helpers/console'

test('domains can be objects with lifecycle methods', t => {
  const repo = new Microcosm()

  repo.addDomain('key', {
    getInitialState: () => true
  })

  t.is(repo.state.key, true)
})

test('warns if a register handler is undefined', t => {
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

  t.is(logger.count('warn'), 1)

  logger.restore()
})

test('can control if state should be committed', t => {
  const repo = new Microcosm()
  const add  = n => n

  t.plan(1)

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

  var first = repo.state

  repo.push(add, 0.1).onDone(function() {
    t.is(repo.state.count, first.count)
  })

})

test('domain have a setup step', t => {
  const repo = new Microcosm()

  t.plan(1)

  class Counter extends Domain {
    setup() {
      t.pass()
    }
  }

  repo.addDomain('count', Counter)
})

test('last state in shouldCommit starts as initial state', t => {
  const repo = new Microcosm()

  t.plan(1)

  class Counter extends Domain {
    getInitialState() {
      return 0
    }
    shouldCommit(next, last) {
      t.is(last, 0)
    }
  }

  repo.addDomain('count', Counter)
})
