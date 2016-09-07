import test from 'ava'
import Microcosm from '../src/microcosm'
import Store from '../src/store'
import console from './helpers/console'

test('stores can be objects with lifecycle methods', t => {
  const repo = new Microcosm()

  repo.addStore('key', {
    getInitialState: () => true
  })

  t.is(repo.state.key, true)
})

test('warns if a register handler is undefined', t => {
  const repo = new Microcosm()
  const action = n => n

  console.record()

  repo.addStore('key', {
    register() {
      return {
        [action]: undefined
      }
    }
  })

  repo.push(action)

  t.is(console.count('warn'), 1)

  console.restore()
})

test('can control if state should be committed', t => {
  const repo = new Microcosm()
  const add  = n => n

  t.plan(1)

  repo.addStore('count', {
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

test('stores have a setup step', t => {
  const repo = new Microcosm()

  t.plan(1)

  class Counter extends Store {
    setup() {
      t.pass()
    }
  }

  repo.addStore('count', Counter)
})
