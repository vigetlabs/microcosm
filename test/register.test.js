import test from 'ava'
import Microcosm from '../src/microcosm'
import lifecycle from '../src/lifecycle'

const action = a => a

test('sends actions in the context of the store', t => {
  t.plan(1)

  const repo = new Microcosm()

  repo.addStore('test', {
    test: true,

    register() {
      return {
        [action]() {
          t.truthy(this.test)
        }
      }
    }
  })

  repo.push(action)
})

test('returns the same state if a handler is not provided', t => {
  t.plan(1)

  const repo = new Microcosm()

  repo.addStore('test', {
    getInitialState() {
      return 'test'
    }
  })

  repo.push(action).onDone(function() {
    t.is(repo.state.test, 'test')
  })
})

test('allows lifecycle methods as registered actions', t => {
  const repo = new Microcosm()

  repo.addStore('test', {
    register() {
      return {
        [lifecycle.willStart]: () => 'test'
      }
    }
  })

  t.is(repo.state.test, 'test')
})
